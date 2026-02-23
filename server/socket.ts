import { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { log } from "./viteServer";
import { storage } from "./storage";

export interface SocketMessage {
  type: string;
  payload: any;
}

interface UserConnection {
  ws: WebSocket;
  userId: string;
  userType?: string;
}

export function setupWebSockets(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  const clients = new Map<string, UserConnection>();
  const userConnections = new Map<string, WebSocket[]>();

  wss.on("connection", (ws, req) => {
    log(`New WS connection from ${req.socket.remoteAddress}`);

    ws.on("message", (data) => {
      try {
        const message: SocketMessage = JSON.parse(data.toString());
        handleMessage(ws, message, clients, userConnections, wss);
      } catch (err) {
        log(`Failed to parse WS message: ${err}`);
      }
    });

    ws.on("close", () => {
      for (const [id, connection] of clients.entries()) {
        if (connection.ws === ws) {
          const userId = connection.userId;
          clients.delete(id);
          
          const connections = userConnections.get(userId) || [];
          const index = connections.indexOf(ws);
          if (index > -1) {
            connections.splice(index, 1);
          }
          
          if (connections.length === 0) {
            userConnections.delete(userId);
          }
          break;
        }
      }
    });
  });

  return {
    broadcast: (type: string, payload: any) => {
      const message = JSON.stringify({ type, payload });
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    },
    sendToUser: (userId: string, type: string, payload: any) => {
      const connections = userConnections.get(userId) || [];
      const message = JSON.stringify({ type, payload });
      
      connections.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    },
    sendToDriver: (driverId: string, type: string, payload: any) => {
      const connections = userConnections.get(`driver_${driverId}`) || [];
      const message = JSON.stringify({ type, payload });
      
      connections.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    },
    sendToAdmin: (type: string, payload: any) => {
      const connections = userConnections.get('admin_dashboard') || [];
      const message = JSON.stringify({ type, payload });
      
      connections.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  };
}

async function handleMessage(
  ws: WebSocket, 
  message: SocketMessage, 
  clients: Map<string, UserConnection>,
  userConnections: Map<string, WebSocket[]>,
  wss: WebSocketServer
) {
  switch (message.type) {
    case "auth":
      if (message.payload.userId) {
        const userId = message.payload.userId;
        const userType = message.payload.userType || 'customer';
        
        clients.set(`${userId}_${Date.now()}`, {
          ws,
          userId,
          userType
        });
        
        const connections = userConnections.get(userId) || [];
        connections.push(ws);
        userConnections.set(userId, connections);
        
        log(`User ${userId} (${userType}) authenticated via WS`);
      }
      break;
      
    case "location_update":
      const { driverId, latitude, longitude } = message.payload;
      if (driverId && latitude && longitude) {
        const broadcastMsg = JSON.stringify({
          type: "driver_location",
          payload: { driverId, latitude, longitude, timestamp: Date.now() }
        });
        
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(broadcastMsg);
          }
        });
      }
      break;
      
    case "driver_assigned":
      const { orderId, driverId: assignedDriverId, driverName } = message.payload;
      if (orderId && assignedDriverId) {
        const notificationMsg = JSON.stringify({
          type: "new_order_assigned",
          payload: { 
            orderId, 
            driverId: assignedDriverId,
            driverName,
            timestamp: Date.now()
          }
        });
        
        const driverConnections = userConnections.get(`driver_${assignedDriverId}`) || [];
        driverConnections.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(notificationMsg);
          }
        });
      }
      break;
      
    case "order_update":
      const { orderId: updateOrderId, status, message: updateMessage } = message.payload;
      if (updateOrderId && status) {
        const updateMsg = JSON.stringify({
          type: "order_status_changed",
          payload: { 
            orderId: updateOrderId, 
            status,
            message: updateMessage,
            timestamp: Date.now()
          }
        });
        
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(updateMsg);
          }
        });
      }
      break;
  }
}
