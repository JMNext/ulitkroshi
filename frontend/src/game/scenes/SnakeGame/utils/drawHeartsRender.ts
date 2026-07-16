export const drawHeartsRender = (scene: any): void => {
  scene.visualHearts.forEach((h: any) => h?.destroy()); 
  scene.visualHearts = [];
  const isPort = scene.scale.width < scene.scale.height;
  const startX = isPort ? 24 : 70, startY = isPort ? 110 : 130, spacing = isPort ? 32 : 40, size = isPort ? 28 : 36;
  
  for (let i = 0; i < Math.ceil(scene.sState.hp / 25); i++) {
    scene.visualHearts.push(
      scene.add.image(startX + i * spacing, startY, 'icon-life').setDisplaySize(size, size).setOrigin(0, 0.5).setDepth(20)
    );
  }
};
