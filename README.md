# Voxel Sandbox

Небольшая 3D-песочница в духе Minecraft на Three.js, запускается через Node.js.

## Запуск

```bash
npm install
npm start
```

Откройте `http://localhost:3000`. Если порт занят, запустите:

```bash
# macOS/Linux
PORT=3001 npm start

# Windows (PowerShell)
$env:PORT=3001; npm start

# Windows (cmd)
set PORT=3001 && npm start
```

## Управление

- WASD — движение
- Space — прыжок
- Shift — спринт
- ЛКМ — удалить блок
- ПКМ — поставить блок
- Esc — освободить курсор
