
interface Position {
  x: number;
  y: number;
  largura?: number;
  altura?: number;
}

export const detectCollision = (
  item1: Position,
  item2: Position,
  defaultSize: number = 32
): boolean => {
  const item1Width = item1.largura || defaultSize;
  const item1Height = item1.altura || defaultSize;
  const item2Width = item2.largura || defaultSize;
  const item2Height = item2.altura || defaultSize;

  // Calcular as bordas de cada item (considerando que x,y são o centro)
  const item1Left = item1.x - item1Width / 2;
  const item1Right = item1.x + item1Width / 2;
  const item1Top = item1.y - item1Height / 2;
  const item1Bottom = item1.y + item1Height / 2;

  const item2Left = item2.x - item2Width / 2;
  const item2Right = item2.x + item2Width / 2;
  const item2Top = item2.y - item2Height / 2;
  const item2Bottom = item2.y + item2Height / 2;

  // Verificar se há sobreposição
  return !(
    item1Right < item2Left ||
    item1Left > item2Right ||
    item1Bottom < item2Top ||
    item1Top > item2Bottom
  );
};

// Nova função específica para detectar colisão entre placa e mesa
export const detectPlacaMesaCollision = (
  placa: Position,
  mesa: Position,
  placaSize: number = 32,
  mesaSize: number = 32
): boolean => {
  const placaLeft = placa.x - placaSize / 2;
  const placaRight = placa.x + placaSize / 2;
  const placaTop = placa.y - placaSize / 2;
  const placaBottom = placa.y + placaSize / 2;

  const mesaLeft = mesa.x - mesaSize / 2;
  const mesaRight = mesa.x + mesaSize / 2;
  const mesaTop = mesa.y - mesaSize / 2;
  const mesaBottom = mesa.y + mesaSize / 2;

  // Verificar se há sobreposição
  return !(
    placaRight < mesaLeft ||
    placaLeft > mesaRight ||
    placaBottom < mesaTop ||
    placaTop > mesaBottom
  );
};

// Nova função para reposicionar placa quando há colisão com mesa
export const adjustPlacaPositionForMesa = (
  placa: Position,
  mesa: Position,
  placaSize: number = 32,
  mesaSize: number = 32
): { x: number; y: number } => {
  // Posicionar a placa 1 pixel acima da borda superior da mesa
  const mesaTop = mesa.y - mesaSize / 2;
  const newY = mesaTop - placaSize / 2 - 1; // 1 pixel de margem
  
  return {
    x: placa.x,
    y: newY
  };
};

export const findNearestValidPosition = (
  targetPosition: Position,
  existingItems: Position[],
  containerWidth: number = 1400,
  containerHeight: number = 900,
  defaultSize: number = 32,
  margin: number = 10
): { x: number; y: number } => {
  const itemWidth = targetPosition.largura || defaultSize;
  const itemHeight = targetPosition.altura || defaultSize;
  
  // Começar da posição desejada
  let x = targetPosition.x;
  let y = targetPosition.y;
  
  // Se não há colisão na posição atual, retornar ela
  const hasCollision = existingItems.some(item => 
    detectCollision({ x, y, largura: itemWidth, altura: itemHeight }, item, defaultSize)
  );
  
  if (!hasCollision) {
    return { x, y };
  }
  
  // Procurar uma posição válida em espiral
  const step = 20;
  let radius = step;
  const maxRadius = Math.min(containerWidth, containerHeight) / 2;
  
  while (radius < maxRadius) {
    // Verificar posições em um círculo
    const angleStep = Math.PI / 8; // 8 direções
    
    for (let angle = 0; angle < 2 * Math.PI; angle += angleStep) {
      const testX = targetPosition.x + radius * Math.cos(angle);
      const testY = targetPosition.y + radius * Math.sin(angle);
      
      // Verificar se está dentro dos limites do container
      if (
        testX - itemWidth / 2 >= margin &&
        testX + itemWidth / 2 <= containerWidth - margin &&
        testY - itemHeight / 2 >= margin &&
        testY + itemHeight / 2 <= containerHeight - margin
      ) {
        // Verificar se não há colisão
        const testHasCollision = existingItems.some(item =>
          detectCollision({ x: testX, y: testY, largura: itemWidth, altura: itemHeight }, item, defaultSize)
        );
        
        if (!testHasCollision) {
          return { x: testX, y: testY };
        }
      }
    }
    
    radius += step;
  }
  
  // Se não encontrar posição válida, retornar a original
  return { x: targetPosition.x, y: targetPosition.y };
};

// Nova função para encontrar posição válida para placa considerando mesas
export const findValidPositionForPlaca = (
  targetPosition: Position,
  existingPlacas: Position[],
  existingBarraquinhas: Position[],
  mesas: Array<{ x: number; y: number }>,
  containerWidth: number = 1400,
  containerHeight: number = 900,
  placaSize: number = 32,
  mesaSize: number = 32,
  margin: number = 10
): { x: number; y: number } => {
  let x = targetPosition.x;
  let y = targetPosition.y;
  
  // Verificar colisão com mesas primeiro
  const mesaCollision = mesas.find(mesa => 
    detectPlacaMesaCollision({ x, y }, mesa, placaSize, mesaSize)
  );
  
  if (mesaCollision) {
    // Ajustar posição para ficar acima da mesa
    const adjustedPosition = adjustPlacaPositionForMesa(
      { x, y }, 
      mesaCollision, 
      placaSize, 
      mesaSize
    );
    x = adjustedPosition.x;
    y = adjustedPosition.y;
  }
  
  // Verificar colisão com outras placas e barraquinhas
  const allExistingItems = [...existingPlacas, ...existingBarraquinhas];
  const hasCollisionWithOthers = allExistingItems.some(item => 
    detectCollision({ x, y, largura: placaSize, altura: placaSize }, item, 32)
  );
  
  if (!hasCollisionWithOthers) {
    return { x, y };
  }
  
  // Se ainda há colisão, usar o algoritmo espiral
  return findNearestValidPosition(
    { x, y, largura: placaSize, altura: placaSize },
    allExistingItems,
    containerWidth,
    containerHeight,
    32,
    margin
  );
};
