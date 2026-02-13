"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- Product Actions ---

export async function createProduct(data: any) {
  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        discount: data.discount || 0,
        stock: data.stock,
        images: data.images || [],
        brandId: data.brandId,
        categoryId: data.categoryId,
        attributes: data.attributes || {},
      },
    });
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true, product };
  } catch (error) {
    console.error("Create Product Error:", error);
    return { success: false, error: "Failed to create product" };
  }
}

export async function updateProduct(id: string, data: any) {
  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        discount: data.discount,
        stock: data.stock,
        images: data.images,
        brandId: data.brandId,
        categoryId: data.categoryId,
        attributes: data.attributes,
      },
    });
    revalidatePath("/admin/products");
    revalidatePath("/");
    revalidatePath(`/product/${id}`);
    return { success: true, product };
  } catch (error) {
    console.error("Update Product Error:", error);
    return { success: false, error: "Failed to update product" };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id },
    });
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Delete Product Error:", error);
    return { success: false, error: "Failed to delete product" };
  }
}

// --- Category Actions ---

export async function createCategory(data: any) {
  try {
    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        parentId: data.parentId,
        image: data.image,
      },
    });
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true, category };
  } catch (error) {
    console.error("Create Category Error:", error);
    return { success: false, error: "Failed to create category" };
  }
}

// --- Fetching Actions ---

export async function getProducts() {
  return await prisma.product.findMany({
    include: {
      category: true,
      brand: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCategories() {
  return await prisma.category.findMany({
    include: {
      children: true,
    },
  });
}
