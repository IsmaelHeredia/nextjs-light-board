**Light Board** es una plataforma de gestión visual basada en metodologías Kanban, diseñada para organizar flujos de trabajo mediante una estructura jerárquica de espacios de trabajo, tableros y tarjetas interactivas.

## Funcionalidades principales

### Gestión de workspaces

- **Espacios independientes:** Creación, edición y eliminación de áreas de trabajo personalizadas.

- **Personalización visual:** Asignación de wallpapers únicos por workspace mediante una galería integrada.

- **Organización dinámica:** Reordenamiento global de workspaces mediante Drag & Drop.

### Tablero kanban dinámico

- **Flujos de trabajo:** Gestión de columnas con soporte para edición de títulos y eliminación en cascada de contenidos.

- **Tarjetas:** Control total sobre tareas (creación, edición de descripción y gestión de estados).

- **Etiquetas:** Sistema integrado directamente en la tarjeta que permite asignar etiquetas únicas por workspace, garantizando una organización coherente y aislada.

- **Interactividad avanzada:** Sistema de arrastre suave para reordenar columnas y desplazar tarjetas entre ellas de forma intuitiva.

## Capturas de pantalla

A continuación, se muestran algunas imágenes de la aplicación en funcionamiento:

![screenshot](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjD_I_L7r5pIhv3YnC-4DrXONsjdpn6BocyVDznFLuDU7b7EMVA13vtCPi7eAP6S1JsJqRVv0CJUFtMu062OaKXpDEn053NvjCngrh_JMxAi389HKtPcixFTUml90DQjQA8PJzXJb6CzDDGeOCOqje5dHAAdUYSWedgEf4IfmNcRmgiWeyVd1xZoFO_PRI/s1849/1.png)

![screenshot](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiCXfZct7_nO7tRs0n2gVrByGRb-ShlWuyo_hoPmI-4N1N4tdkn3iv0I3yDndDsjP5Ele92t5dTy5bfP_uZxi2U2ZXmDWw_KasbYZggxFpDWGvpi7vJHPhrzJ7HtbbEUX2M9x3DP1ft7497XDo87ixYcpxkW2Xq-0CciP930Y_GEGs2JJa4csbsDE7AVZU/s1849/2.png)

![screenshot](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiD6oJ5goCAs6oifQ5F4MmrH_DSD5qcY2BO0j8Tx-LIxsf7QYTcy0JkaCt4vG0K_CJ0dtPRuh1X8nuxyTtTtXX1N4uPTh8KExcKN6OQ78tWdZfulrY2WnCnF1pVD_B8VR15Z_OSlRngj01VDejbs_Xa80bRupqp1Kx2qT0q_RuWMvb6FwXttfd4aZTYmlU/s1850/3.png)

![screenshot](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgCL4hNyxUbzNIZlrzOrFNiEaiRR-NCryRpDDSkAGAKowWXmoQcXlWYLeIxfbLidTDsmQ3TN4Vn7eUCKbDueI6rTUWyEgtzRTXuWAPHruziv2TmsJpAYpTi8GfNAKQNLQU5At7GXv5wIkvQzdtddsiVGRT-qsnBygy_hpo-t2YGTB1qgEYo3cfLBH1w0XU/s1847/4.png)

![screenshot](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjZuiBzN2Y0GklFHYHtJ7aij5OA9KG1gNpIblP8GydbXL4k9U3Frj011rDSEnIVCXfWyImcwse4u_U9FVW2FvtFIZngO7-SJg_QdP6GLjHv9vgIxLe5O2CIPEyIMZcV6Z-hGPE5gaA1R6rI3KzeO4O3WdDhEPFqbKfdPSQQshzWrKdwE7Qotn4JynVyCWo/s1847/5.png)

![screenshot](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgh37tlJNUimJlvEPIfZBRqaCiRzOij0ecNI8yqgyl6eraxxhmWbymGERZau7SRfoWFwHytKnGpkTE6vJxDIDFQiU-BqL0kn0XtjFEDoO9Dq4JNdtf2DH02TSmR2-yqpmwSyWg1tAnDtBUoiZZ8Z-olRRKJD-6sCcPHkfNGT4KctZRn9uE_C6cr-nFILs8/s1847/6.png)

![screenshot](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi-pnxY23ExHq_K60MWGNvA9vviXQ62okROcPCDJGjsNx0agwTktko7RlnK9Dj1hVIzBKikHtRT5-HYcStQrZG4QMdG3UMQoS7Ez1QHZOwWlXmV2FRddXHJFjH9PpkOe_lglIjG43Fw7OkpHQMouMek_zrc5IbC9J7QHZv3PZCny-M5WL4dLDv7HAVI8Gg/s1846/7.png)

### Instalación del proyecto

**1.** Clonar el repositorio

```
git clone https://github.com/IsmaelHeredia/nextjs-light-board.git
cd nextjs-light-board
```

**2.** Instalación de dependencias

```
npm install
```

**3.** Variables de entorno

Crea un archivo .env en la raíz del proyecto:

```
NODE_ENV=development
```

**4.** Inicializar la base de datos

Para crear la bd:

```
npm run generate
npm run migrate
```

**5.** Para ejecutar los seeds de prueba:

```
npm run seed
```

**6.** Ejecución del proyecto en modo desarrollo

```
npm run dev
```

**7.** Build de producción

```
npm run build
npm start
```

### Pruebas de integración

El proyecto incluye tests de integración reales sobre las rutas API.

Para ejecutar los tests:

```
npm test
```

### Uso con Docker

Para poner en marcha el servicio de **NextJS** usando **Docker**, se debe ejecutar el siguiente comando:

```
docker compose up -d --build
```

Una vez que el servicio esté activo, se podra acceder desde las siguiente URL:

```
http://localhost:3000
```