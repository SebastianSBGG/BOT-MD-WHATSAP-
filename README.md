# MODE MD

Bot de WhatsApp multifuncional basado en Node.js (compatible con Node 22), con más de 250 plugins organizados por categorías: administración de grupos, descargas, IA, juegos, gacha, stickers, RPG, y más.

Este script es gratuito y de código abierto.
## Hosting recomendado

Si quieres correr tu propia instancia sin depender de tu celular o PC, estas son opciones evaluadas:

### De pago (más estables)

**[Daki Hosting](https://billing.daki.cc/products/appbot-hosting)** — Planes App/Bot Hosting:

| Plan | CPU | RAM | Disco | Splits | Precio |
|------|-----|-----|-------|--------|--------|
| Bronze | 100% | 2 GB | 6 GB | 2 | €2,00 |
| Silver | 200% | 4 GB | 9 GB | 3 | €4,00 |
| Gold | 300% | 6 GB | 12 GB | 4 | €6,00 |

**[Solar Hosting](https://solarhosting.cc/bot-hosting.html)** — Plan personalizable, armas tu propia config:

| Recurso | Rango | Precio unitario |
|---------|-------|------------------|
| RAM | 1–16 GB | $0,70 por GB |
| Storage | 5–100 GB | $0,02 por GB |
| vCores | 1–8 | $1,00 por core |

Config mínima (1 GB RAM / 5 GB / 1 vCore): $1,80/mes. Incluye 2 BD MySQL y protección DDoS de 100G. Descuentos por ciclo: Quarterly -43%, Biannual -47%, Yearly -53%, 2-Year -55%.

### Gratis (con limitaciones)

**[OptikLink](https://optiklink.net/home)** — Servidores Node.js gratuitos, pero requiere verificación tipo "braven" y cuenta de Discord activa, además de mostrar anuncios. Buena opción para pruebas, no ideal para producción 24/7.

> Recomendación: Daki Bronze (€2, fijo) vs Solar mínimo ($1,80, ajustable) quedan casi al mismo precio. La diferencia es que en Solar puedes subir solo la RAM sin pagar por más CPU/disco si Luciana MD lo necesita, mientras que en Daki subes de plan completo.
## Canal de WhatsApp

Para avisos, actualizaciones y soporte, únete al canal oficial:

https://whatsapp.com/channel/0029VbBa4MrDeONCjMXups1r

## Requisitos

- Node.js 20 o superior
- npm 10 o superior
- Un servidor con Node.js disponible (VPS, hosting, o cualquier entorno compatible) si quieres correr tu propia instancia

## Instalación

```
git clone https://github.com/SebastianSBGG/BOT-MD-WHATSAP-
cd BOT-MD-WHATSAP-
npm install --legacy-peer-deps
```

## Configuración

Antes de iniciar, configura tus propios datos (número de owner, nombre del bot, etc.) en el archivo de configuración correspondiente del proyecto.

## Uso

Iniciar en modo normal:

```
npm start
```

Iniciar en modo desarrollo (con recarga automática):

```
npm run dev
```

Iniciar con PM2 (recomendado para producción):

```
npm run start:pm2
```

## Funcionalidades principales

- Administración de grupos: mute, expulsión, bienvenidas, antilink, y más
- Descargas: YouTube, Spotify, redes sociales
- Inteligencia artificial: comandos conversacionales integrados
- Gacha y RPG: sistema de coleccionables, economía interna y progresión
- Stickers: creación, edición y efectos
- Herramientas: utilidades de imagen, audio y texto
- Sistema de subbots (jadibots)
- Álbum de figuritas temático (mundial)
- Diagnóstico y herramientas de owner para mantenimiento del bot

## Comandos

Usa el comando de menú del bot una vez iniciado para ver la lista completa y actualizada de comandos disponibles.

## Contribuir

Las contribuciones son bienvenidas. Si encuentras un error o quieres proponer una mejora, abre un issue o un pull request en este repositorio.

## Licencia

Este proyecto se distribuye bajo licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Aviso legal

Los plugins de descarga (YouTube, Spotify, redes sociales, etc.) se ofrecen con fines educativos y de uso personal. El uso de estas funciones para distribuir contenido protegido por derechos de autor es responsabilidad exclusiva de quien lo utilice.

## Crédito

Desarrollado y mantenido por Sebastián.
