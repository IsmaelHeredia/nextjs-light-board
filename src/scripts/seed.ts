import { db } from "../db";
import {
  workspaces,
  columns,
  tasks,
  tags,
  tasksToTags,
  galleryImages,
} from "../db/schema";

async function main() {
  console.log("Iniciando seed...");

  console.log("Limpiando base de datos...");
  await db.delete(tasksToTags);
  await db.delete(tasks);
  await db.delete(columns);
  await db.delete(tags);
  await db.delete(workspaces);
  await db.delete(galleryImages);

  console.log("Poblando galería...");
  await db.insert(galleryImages).values([
    { id: "gal-1", url: "/api/images/test1.jpg" },
    { id: "gal-2", url: "/api/images/test2.jpg" },
    { id: "gal-3", url: "/api/images/test3.jpg" },
    { id: "gal-4", url: "/api/images/test4.jpg" },
  ]);

  console.log("Creando workspaces...");
  await db.insert(workspaces).values([
    { id: "ws-1", title: "Equipo de Marketing", imageId: "gal-1", order: 0, createdAt: new Date() },
    { id: "ws-2", title: "Lanzamiento de Producto", imageId: "gal-2", order: 1, createdAt: new Date() },
    { id: "ws-3", title: "Rediseño de App Móvil", imageId: "gal-3", order: 2, createdAt: new Date() },
    { id: "ws-4", title: "Portal Interno de RRHH", imageId: "gal-4", order: 3, createdAt: new Date() },
  ]);

  console.log("Creando columnas...");
  await db.insert(columns).values([
    { id: "col-mkt-0", workspaceId: "ws-1", title: "Pendientes", order: 0 },
    { id: "col-mkt-1", workspaceId: "ws-1", title: "Por Hacer", order: 1 },
    { id: "col-mkt-2", workspaceId: "ws-1", title: "En Progreso", order: 2 },
    { id: "col-mkt-3", workspaceId: "ws-1", title: "Completadas", order: 4 },

    { id: "col-prod-0", workspaceId: "ws-2", title: "Ideas", order: 0 },
    { id: "col-prod-1", workspaceId: "ws-2", title: "Planificadas", order: 1 },
    { id: "col-prod-2", workspaceId: "ws-2", title: "Desarrollo", order: 2 },
    { id: "col-prod-3", workspaceId: "ws-2", title: "QA", order: 3 },
    { id: "col-prod-4", workspaceId: "ws-2", title: "Lanzadas", order: 4 },
  ]);

  console.log("Creando tags...");
  await db.insert(tags).values([
    { id: "tag-mkt-1", workspaceId: "ws-1", name: "SEO", color: "#579dff" },
    { id: "tag-mkt-2", workspaceId: "ws-1", name: "Contenido", color: "#faa53d" },
    { id: "tag-mkt-3", workspaceId: "ws-1", name: "Diseño", color: "#4bce97" },
    { id: "tag-mkt-4", workspaceId: "ws-1", name: "Alta Prioridad", color: "#f87168" },
    { id: "tag-mkt-5", workspaceId: "ws-1", name: "Analítica", color: "#9f8fef" },

    { id: "tag-prod-1", workspaceId: "ws-2", name: "Frontend", color: "#579dff" },
    { id: "tag-prod-2", workspaceId: "ws-2", name: "Backend", color: "#60c6ed" },
    { id: "tag-prod-3", workspaceId: "ws-2", name: "Bug", color: "#f87168" },
    { id: "tag-prod-4", workspaceId: "ws-2", name: "Urgente", color: "#ae2e24" },
    { id: "tag-prod-5", workspaceId: "ws-2", name: "Pruebas", color: "#b65d13" },
  ]);

  console.log("Creando tareas...");

  const marketingTasks = [
    { id: "task-mkt-1", columnId: "col-mkt-0", title: "Investigación de palabras clave Q2", description: "Analizar tendencias de búsqueda e identificar palabras clave más relevantes para el próximo trimestre.", order: 0 },
    { id: "task-mkt-2", columnId: "col-mkt-0", title: "Actualizar calendario de contenidos", description: "Agregar nuevos blogs y campañas de redes sociales al calendario de contenidos.", order: 1 },
    { id: "task-mkt-3", columnId: "col-mkt-0", title: "Diseñar plantillas de redes sociales", description: "Crear plantillas para Instagram y LinkedIn para la próxima campaña.", order: 2 },
    { id: "task-mkt-4", columnId: "col-mkt-0", title: "Configurar automatización de emails", description: "Configurar campañas automáticas para nuevos leads.", order: 3 },

    { id: "task-mkt-5", columnId: "col-mkt-1", title: "Redactar artículo sobre tendencias SEO", description: "Cubrir las últimas tendencias de SEO para startups tecnológicas.", order: 0 },
    { id: "task-mkt-6", columnId: "col-mkt-1", title: "Publicación en redes del lanzamiento de producto", description: "Escribir textos y hashtags para LinkedIn y Twitter.", order: 1 },
    { id: "task-mkt-7", columnId: "col-mkt-1", title: "Actualizar panel de analíticas", description: "Agregar métricas de tasa de conversión al panel de control.", order: 2 },
    { id: "task-mkt-8", columnId: "col-mkt-1", title: "Preparar lista de influencers", description: "Identificar influencers relevantes en tecnología y marketing.", order: 3 },

    { id: "task-mkt-9", columnId: "col-mkt-2", title: "Optimizar SEO de landing page", description: "Mejorar meta tags, encabezados y enlaces internos.", order: 0 },
    { id: "task-mkt-10", columnId: "col-mkt-2", title: "Diseñar banners publicitarios", description: "Crear banners para campañas de Google Ads.", order: 1 },
    { id: "task-mkt-11", columnId: "col-mkt-2", title: "Plan de contenido en video", description: "Storyboard de contenido de video para redes sociales.", order: 2 },
    { id: "task-mkt-12", columnId: "col-mkt-2", title: "Pruebas A/B de CTA", description: "Probar diferentes colores y textos de botones en la landing page.", order: 3 },
    { id: "task-mkt-13", columnId: "col-mkt-2", title: "Auditoría de backlinks", description: "Verificar calidad y relevancia de los backlinks para SEO.", order: 4 },
    { id: "task-mkt-14", columnId: "col-mkt-2", title: "Coordinar con el equipo de diseño", description: "Asegurar que todos los elementos visuales cumplan con la guía de marca.", order: 5 },

    { id: "task-mkt-18", columnId: "col-mkt-3", title: "Lanzar campaña Q1", description: "Campañas ejecutadas en todos los canales.", order: 0 },
    { id: "task-mkt-19", columnId: "col-mkt-3", title: "Auditoría de redes sociales", description: "Revisión de todas las cuentas de redes sociales y métricas de engagement.", order: 1 },
  ];

  const productTasks = [
    { id: "task-prod-1", columnId: "col-prod-0", title: "Lluvia de ideas de funcionalidades", description: "Recopilar opiniones de stakeholders y usuarios.", order: 0 },
    { id: "task-prod-2", columnId: "col-prod-0", title: "Investigar productos de la competencia", description: "Analizar características, precios y experiencia de usuario.", order: 1 },
    { id: "task-prod-3", columnId: "col-prod-0", title: "Definir alcance del MVP", description: "Seleccionar funcionalidades esenciales para el lanzamiento inicial.", order: 2 },
    { id: "task-prod-4", columnId: "col-prod-0", title: "Esbozar wireframes", description: "Diseño básico de layout para móvil y escritorio.", order: 3 },
    { id: "task-prod-5", columnId: "col-prod-0", title: "Validar ideas con usuarios", description: "Entrevistar a 10 usuarios objetivo sobre funcionalidades.", order: 4 },

    { id: "task-prod-6", columnId: "col-prod-1", title: "Redactar requisitos del producto", description: "Especificar características del MVP.", order: 0 },
    { id: "task-prod-7", columnId: "col-prod-1", title: "Planificar sprints", description: "Definir sprints de 2 semanas y backlog.", order: 1 },
    { id: "task-prod-8", columnId: "col-prod-1", title: "Configurar tablero del proyecto", description: "Configurar columnas, tareas y etiquetas.", order: 2 },
    { id: "task-prod-9", columnId: "col-prod-1", title: "Definir stack tecnológico", description: "Decidir frontend, backend, base de datos y CI.", order: 3 },

    { id: "task-prod-10", columnId: "col-prod-2", title: "Implementar autenticación", description: "Flujos de registro, inicio de sesión y recuperación de contraseña.", order: 0 },
    { id: "task-prod-11", columnId: "col-prod-2", title: "Desarrollar UI del dashboard", description: "Gráficos interactivos y widgets de resumen.", order: 1 },
    { id: "task-prod-12", columnId: "col-prod-2", title: "Configurar API REST", description: "Endpoints para usuarios, tareas y analíticas.", order: 2 },
    { id: "task-prod-13", columnId: "col-prod-2", title: "Integrar servicio de email", description: "Enviar notificaciones y recordatorios a usuarios.", order: 3 },
    { id: "task-prod-14", columnId: "col-prod-2", title: "Diseñar esquema de base de datos", description: "Definir tablas, relaciones y restricciones.", order: 4 },
    { id: "task-prod-15", columnId: "col-prod-2", title: "Implementar pruebas unitarias", description: "Cubrir la lógica central con tests automatizados.", order: 5 },

    { id: "task-prod-16", columnId: "col-prod-3", title: "Realizar pruebas funcionales", description: "Verificar que todas las funcionalidades funcionen correctamente.", order: 0 },
    { id: "task-prod-17", columnId: "col-prod-3", title: "Triar bugs", description: "Priorizar y asignar errores a desarrolladores.", order: 1 },
    { id: "task-prod-18", columnId: "col-prod-3", title: "Pruebas cross-browser", description: "Testear en Chrome, Firefox, Safari y Edge.", order: 2 },

    { id: "task-prod-19", columnId: "col-prod-4", title: "Desplegar MVP", description: "Lanzar la versión inicial a usuarios tempranos.", order: 0 },
    { id: "task-prod-20", columnId: "col-prod-4", title: "Recopilar feedback de usuarios", description: "Obtener retroalimentación cualitativa y cuantitativa.", order: 1 },
  ];

  await db.insert(tasks).values([...marketingTasks, ...productTasks]);

  console.log("Relacionando tareas con tags...");

  const tasksToTagsValues = [
    { taskId: "task-mkt-1", tagId: "tag-mkt-1" },
    { taskId: "task-mkt-2", tagId: "tag-mkt-2" },
    { taskId: "task-mkt-3", tagId: "tag-mkt-3" },
    { taskId: "task-mkt-4", tagId: "tag-mkt-4" },
    { taskId: "task-mkt-5", tagId: "tag-mkt-2" },
    { taskId: "task-mkt-6", tagId: "tag-mkt-2" },
    { taskId: "task-mkt-7", tagId: "tag-mkt-5" },
    { taskId: "task-mkt-8", tagId: "tag-mkt-3" },
    { taskId: "task-mkt-9", tagId: "tag-mkt-1" },
    { taskId: "task-mkt-10", tagId: "tag-mkt-3" },

    { taskId: "task-prod-1", tagId: "tag-prod-1" },
    { taskId: "task-prod-2", tagId: "tag-prod-2" },
    { taskId: "task-prod-3", tagId: "tag-prod-1" },
    { taskId: "task-prod-4", tagId: "tag-prod-1" },
    { taskId: "task-prod-5", tagId: "tag-prod-5" },
    { taskId: "task-prod-6", tagId: "tag-prod-2" },
    { taskId: "task-prod-7", tagId: "tag-prod-2" },
    { taskId: "task-prod-8", tagId: "tag-prod-1" },
    { taskId: "task-prod-9", tagId: "tag-prod-4" },
    { taskId: "task-prod-10", tagId: "tag-prod-1" },
  ];

  await db.insert(tasksToTags).values(tasksToTagsValues);

  console.log("Seed completo");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error en el seed:", err);
    process.exit(1);
  });