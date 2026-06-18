const prisma = require('../config/prisma');
const AuditService = require('./audit.service');

/**
 * Service para manejar la lógica de negocio de Categorías.
 * Desacopla la lógica de base de datos del controlador.
 */
class CategoryService {
  
  /**
   * Obtener todas las categorías (plana)
   * @returns {Promise<Array>} Lista de categorías
   */
  async getAllCategories(rubroSlug) {
    const where = {};
    if (rubroSlug) {
      // Filtrar categorías que tengan productos del rubro indicado Y del tenant activo.
      // El middleware Prisma inyecta tenantId en la query raíz (category),
      // pero el sub-filtro de products requiere tenantId explícito para
      // evitar que aparezcan categorías de otros tenants que compartan el mismo rubro.
      where.products = { some: { rubro: { slug: rubroSlug }, isDeleted: false } };
    }
    return await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: { where: { isDeleted: false } } } }
      }
    });
  }

  /**
   * Obtener árbol de categorías jerárquico (L1 -> L2 -> L3...)
   * @returns {Promise<Array>} Lista de categorías raíz con sus hijos anidados
   */
  async getCategoryTree(rubroSlug) {
    const where = {};
    if (rubroSlug) {
      // Igual que en getAllCategories: el sub-filtro de productos
      // debe restringirse a productos no eliminados del rubro indicado.
      // El tenantId del tenant activo es inyectado automáticamente por Prisma
      // en el modelo Category raíz.
      where.products = { some: { rubro: { slug: rubroSlug }, isDeleted: false } };
    }

    const allCategories = await prisma.category.findMany({
      where,
      orderBy: {
        name: "asc", 
      },
      include: {
        _count: {
          select: {
            products: { where: { isDeleted: false } }
          }
        }
      }
    });

    // Construir árbol en memoria
    const categoryMap = new Map();
    const roots = [];

    // 1. Inicializar mapa
    allCategories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // 2. Asociar hijos a padres
    allCategories.forEach(cat => {
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          parent.children.push(categoryMap.get(cat.id));
        } else {
          roots.push(categoryMap.get(cat.id));
        }
      } else {
        roots.push(categoryMap.get(cat.id));
      }
    });

    return roots;
  }

  /**
   * Obtener una categoría por ID
   * @param {number} id 
   * @returns {Promise<Object>} Categoría encontrada
   */
  async getCategoryById(id) {
    return await prisma.category.findFirst({
      where: { id: parseInt(id) },
      include: { products: true }
    });
  }

  /**
   * Crear nueva categoría
   * @param {Object} data - { name, descripcion }
   * @returns {Promise<Object>} Categoría creada
   */
  async createCategory(data) {
    // Validar si slug ya existe si se proporciona, o manejar lógica de unicidad
    const existing = await prisma.category.findFirst({
        where: { slug: data.slug } 
    });
    
    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug, 
        description: data.description,
        parentId: data.parentId || null
      }
    });

    if (data.adminId) {
      await AuditService.logAction({
        adminId: data.adminId,
        action: 'CREATE_CATEGORY',
        entityType: 'CATEGORY',
        entityId: category.id,
        branchId: data.branchId || null,
        changes: data,
        ip: data.ip
      });
    }

    return category;
  }

  /**
   * Actualizar categoría
   * @param {number} id 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async updateCategory(id, data) {
    const catId = parseInt(id);
    const existing = await prisma.category.findFirst({ where: { id: catId } });
    if (!existing) throw new Error('Category not found');

    const category = await prisma.category.update({
      where: { id: catId },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        parentId: data.parentId !== undefined ? data.parentId : undefined
      }
    });

    if (data.adminId) {
      const changes = {};
      const updateData = {
        name: data.name,
        slug: data.slug,
        description: data.description,
        parentId: data.parentId
      };

      Object.keys(updateData).forEach(k => {
        if (updateData[k] !== undefined && existing[k] !== updateData[k]) {
          changes[k] = { prev: existing[k], new: updateData[k] };
        }
      });

      if (Object.keys(changes).length > 0) {
        await AuditService.logAction({
          adminId: data.adminId,
          action: 'UPDATE_CATEGORY',
          entityType: 'CATEGORY',
          entityId: catId,
          branchId: data.branchId || null,
          changes,
          ip: data.ip
        });
      }
    }

    return category;
  }

  /**
   * Eliminar categoría
   * @param {number} id 
   * @returns {Promise<Object>}
   */
  async deleteCategory(id, adminId, ip, branchId = null) {
    // Validar si tiene productos asociados antes de borrar
    const category = await prisma.category.findFirst({
        where: { id: parseInt(id) },
        include: { _count: { select: { products: true } } }
    });

    if (!category) throw new Error('Categoría no encontrada');
    if (category._count.products > 0) {
        throw new Error('No se puede eliminar una categoría que tiene productos asociados.');
    }

    const result = await prisma.category.delete({
      where: { id: parseInt(id) }
    });

    if (adminId) {
      await AuditService.logAction({
        adminId,
        action: 'DELETE_CATEGORY',
        entityType: 'CATEGORY',
        entityId: parseInt(id),
        branchId: branchId || null,
        changes: { name: category.name },
        ip
      });
    }

    return result;
  }
}

module.exports = new CategoryService();
