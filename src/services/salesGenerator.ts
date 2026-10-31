import { DifficultyLevel, GeneratedOrderItem, GeneratedSalesOrder, Product } from '../types';
import { formatCents } from './api';

/**
 * Normaliza nombres de productos con sus contenedores y plurales en español para pedidos realistas.
 */
function formatProductRequestName(productName: string, quantity: number): string {
  const clean = productName.trim().toLowerCase();

  if (clean.includes('agua')) {
    return quantity === 1 ? '1 botella de agua' : `${quantity} botellas de agua`;
  }
  if (clean.includes('galleta')) {
    return quantity === 1 ? '1 paquete de galletas' : `${quantity} paquetes de galletas`;
  }
  if (clean.includes('papa')) {
    return quantity === 1 ? '1 paquete de papas fritas' : `${quantity} paquetes de papas fritas`;
  }
  if (clean.includes('atún') || clean.includes('atun')) {
    return quantity === 1 ? '1 lata de atún' : `${quantity} latas de atún`;
  }
  if (clean.includes('yogur')) {
    return quantity === 1 ? '1 yogur' : `${quantity} yogures`;
  }
  if (clean.includes('pan')) {
    return quantity === 1 ? '1 pan' : `${quantity} panes`;
  }
  if (clean.includes('leche')) {
    return quantity === 1 ? '1 cartón de leche' : `${quantity} cartones de leche`;
  }
  if (clean.includes('chocolate')) {
    return quantity === 1 ? '1 chocolate' : `${quantity} chocolates`;
  }
  if (clean.includes('caramelo')) {
    return quantity === 1 ? '1 caramelo' : `${quantity} caramelos`;
  }
  if (clean.includes('jugo')) {
    return quantity === 1 ? '1 jugo' : `${quantity} jugos`;
  }
  if (clean.includes('arroz')) {
    return quantity === 1 ? '1 funda de arroz' : `${quantity} fundas de arroz`;
  }
  if (clean.includes('aceite')) {
    return quantity === 1 ? '1 botella de aceite' : `${quantity} botellas de aceite`;
  }

  // Genérico
  return `${quantity} ${productName.toLowerCase()}${quantity > 1 ? 's' : ''}`;
}

/**
 * Une elementos en una oración en español ("X, Y y Z" o "X y Y").
 */
function joinSpanishList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} y ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}

/**
 * Convierte un número pequeño a palabras para mejorar la dicción del sintetizador de voz (TTS).
 */
function numberToSpeechWord(num: number): string {
  const map: Record<number, string> = {
    1: 'un',
    2: 'dos',
    3: 'tres',
    4: 'cuatro',
    5: 'cinco',
    6: 'seis',
    7: 'siete',
    8: 'ocho',
    9: 'nueve',
    10: 'diez',
  };
  return map[num] || String(num);
}

/**
 * Calcula un importe de pago realista en efectivo variando la complejidad según la dificultad pedagógica:
 * - FÁCIL: Pago con denominaciones pequeñas y directas ($1, $2, $5). Cambio mínimo o exacto.
 * - MEDIO: Pago con billetes comunes ($5, $10, $20). Cambio con combinaciones decimales moderadas.
 * - AVANZADO: Pago con billetes mayores ($10, $20, $50). Cambio con mayor dispersión de monedas y billetes.
 */
function calculateTenderAmount(totalCents: number, difficulty: DifficultyLevel): number {
  if (difficulty === 'facil') {
    // Denominaciones comunes bajas: $1 (100), $2 (200), $5 (500)
    const easyTenders = [100, 200, 500].filter((t) => t >= totalCents);
    if (easyTenders.length > 0) {
      // Priorizar el billete/moneda más cercano para mantener un cambio simple y accesible
      return easyTenders[0];
    }
    // Si el total supera $5, redondear al siguiente dólar
    return Math.ceil(totalCents / 100) * 100;
  }

  if (difficulty === 'medio') {
    // Billetes estándar: $5 (500), $10 (1000), $20 (2000)
    const mediumTenders = [500, 1000, 2000].filter((t) => t >= totalCents);
    if (mediumTenders.length > 0) {
      const pool = mediumTenders.slice(0, Math.min(2, mediumTenders.length));
      return pool[Math.floor(Math.random() * pool.length)];
    }
    return Math.ceil(totalCents / 500) * 500;
  }

  // AVANZADO: Billetes mayores y combinaciones más complejas: $10 (1000), $20 (2000), $50 (5000)
  const advancedTenders = [1000, 2000, 5000].filter((t) => t >= totalCents);
  if (advancedTenders.length > 0) {
    const pool = advancedTenders.slice(0, Math.min(3, advancedTenders.length));
    return pool[Math.floor(Math.random() * pool.length)];
  }
  return Math.ceil(totalCents / 1000) * 1000;
}

/**
 * Genera un pedido de venta controlado aleatoriamente según el nivel de dificultad pedagógica del estudiante.
 * Reglas estrictas NO solapadas (non-overlapping) para el conteo de productos distintos:
 *
 * FÁCIL:
 * - EXACTAMENTE 1 producto activo distinto.
 * - Cantidad: 1–2 unidades.
 * - Nunca genera 2 ni 3 productos.
 *
 * MEDIO:
 * - EXACTAMENTE 2 productos activos distintos.
 * - Cantidad por producto: 1–3 unidades.
 * - Nunca genera 1 ni 3 productos.
 *
 * AVANZADO:
 * - EXACTAMENTE 3 productos activos distintos.
 * - Cantidad por producto: 1–4 unidades.
 * - Nunca genera 1 ni 2 productos (salvo degradación por falta de inventario activo).
 *
 * Degradación grácil:
 * Si hay menos de 3 productos activos y el estudiante está configurado en Avanzado (o menos de 2 en Medio),
 * se degrada grácilmente a la mayor cantidad factible, registrando y advirtiendo pedagógicamente la limitación.
 */
export function generateSalesOrder(
  products: Product[],
  difficulty: DifficultyLevel = 'facil'
): GeneratedSalesOrder {
  // Filtrar exclusivamente productos activos
  const activeProducts = products.filter((p) => p.active);

  // Determinar la cantidad exacta de productos distintos según la dificultad
  let exactTargetDistinct: number;
  let maxQtyPerProduct: number;

  switch (difficulty) {
    case 'facil':
      exactTargetDistinct = 1;
      maxQtyPerProduct = 2; // 1–2 unidades
      break;
    case 'medio':
      exactTargetDistinct = 2;
      maxQtyPerProduct = 3; // 1–3 unidades por producto
      break;
    case 'avanzado':
    default:
      exactTargetDistinct = 3;
      maxQtyPerProduct = 4; // 1–4 unidades por producto
      break;
  }

  // Contingencia si no hay productos activos en absoluto
  if (activeProducts.length === 0) {
    console.warn('[Venta y caja] No hay productos activos disponibles en el inventario. Se usa producto de contingencia.');
    const fallbackItem: GeneratedOrderItem = {
      productId: 'P001',
      productName: 'Agua',
      visualKey: 'water',
      quantity: 1,
      unitPriceCents: 50,
      subtotalCents: 50,
    };
    return {
      generatedOrderId: `ORD-${Date.now()}-contingencia`,
      difficulty,
      lineItems: [fallbackItem],
      totalExpectedCents: 50,
      paymentAmountCents: 100,
      changeExpectedCents: 50,
      instruction: 'Un cliente solicita 1 botella de agua.',
      audioInstruction: 'El cliente solicita una botella de agua.',
      hintText: 'Paso 1: Busca Agua en la lista y selecciona 1 unidad.',
      exampleText: '1 botella de agua cuesta $0,50.',
      generatedAt: new Date().toISOString(),
      degraded: true,
      degradationNotice: 'Aviso pedagógico: No hay productos activos configurados en la tienda. Se utilizó un producto básico de respaldo.',
    };
  }

  // Evaluar degradación grácil si no hay suficientes productos activos para cumplir la regla estricta
  let targetDistinct = exactTargetDistinct;
  let isDegraded = false;
  let degradationNotice: string | undefined = undefined;

  if (activeProducts.length < exactTargetDistinct) {
    targetDistinct = activeProducts.length;
    isDegraded = true;
    degradationNotice = `Aviso pedagógico: La configuración de nivel ${
      difficulty === 'avanzado' ? 'Avanzado' : 'Medio'
    } requiere exactamente ${exactTargetDistinct} productos distintos, pero solo existen ${
      activeProducts.length
    } ${activeProducts.length === 1 ? 'producto activo' : 'productos activos'} en el inventario. Se ajustó al máximo factible (${targetDistinct} ${
      targetDistinct === 1 ? 'producto' : 'productos'
    }).`;

    console.warn(
      `[Venta y caja] Degradación de complejidad pedagógica: ${degradationNotice}`
    );
  }

  let attempts = 0;
  while (attempts < 30) {
    attempts++;

    // Seleccionar aleatoriamente los productos SIN repetición
    const shuffled = [...activeProducts].sort(() => 0.5 - Math.random());
    const selectedProducts = shuffled.slice(0, targetDistinct);

    // Asignar cantidades unitarias según el rango estricto de la dificultad
    const lineItems: GeneratedOrderItem[] = selectedProducts.map((p) => {
      // Fácil: 1-2 | Medio: 1-3 | Avanzado: 1-4
      const quantity = Math.floor(Math.random() * maxQtyPerProduct) + 1;
      const unitPriceCents = p.priceCents;
      const subtotalCents = unitPriceCents * quantity;
      return {
        productId: p.id,
        productName: p.name,
        visualKey: p.visualKey,
        quantity,
        unitPriceCents,
        subtotalCents,
      };
    });

    const totalExpectedCents = lineItems.reduce((sum, item) => sum + item.subtotalCents, 0);

    // Validación programática de la orden
    if (totalExpectedCents <= 0) continue;

    const paymentAmountCents = calculateTenderAmount(totalExpectedCents, difficulty);
    const changeExpectedCents = paymentAmountCents - totalExpectedCents;

    if (changeExpectedCents < 0) continue;

    // Generar redacción gramatical natural en español
    const requestPhrases = lineItems.map((item) =>
      formatProductRequestName(item.productName, item.quantity)
    );
    const customerSentence = `Un cliente solicita ${joinSpanishList(requestPhrases)}.`;

    // Generar texto fonético optimizado para síntesis de voz (TTS)
    const audioItems = lineItems.map((item) => {
      const qtyWord = numberToSpeechWord(item.quantity);
      const name = formatProductRequestName(item.productName, item.quantity).replace(/^\d+\s*/, '');
      return `${qtyWord} ${name}`;
    });
    const audioInstruction = `El cliente solicita: ${joinSpanishList(audioItems)}.`;

    // Generar apoyos didácticos (pistas y ejemplos) diferenciados por nivel de andamiaje:
    let hintText = '';
    let exampleText = '';

    if (difficulty === 'facil') {
      // Alto andamiaje: Guía paso a paso muy directa con el único producto
      const item = lineItems[0];
      hintText = `Paso 1: Busca ${item.productName} en el catálogo. Paso 2: Selecciona ${item.quantity} ${
        item.quantity === 1 ? 'unidad' : 'unidades'
      }. Cálculo guiado: ${item.quantity} × ${formatCents(item.unitPriceCents)} = ${formatCents(
        item.subtotalCents
      )}.`;
      exampleText = `${item.quantity} ${item.quantity === 1 ? 'unidad' : 'unidades'} de ${
        item.productName
      } a ${formatCents(item.unitPriceCents)} cada una suman ${formatCents(item.subtotalCents)}.`;
    } else if (difficulty === 'medio') {
      // Andamiaje medio: Guía estructurada para dos productos combinados
      const it1 = lineItems[0];
      const it2 = lineItems[1] || it1;
      hintText = `Paso 1: Calcula el subtotal de ${it1.productName} (${it1.quantity} × ${formatCents(
        it1.unitPriceCents
      )} = ${formatCents(it1.subtotalCents)}). Paso 2: Calcula el subtotal de ${it2.productName} (${
        it2.quantity
      } × ${formatCents(it2.unitPriceCents)} = ${formatCents(it2.subtotalCents)}). Paso 3: Suma ambos subtotales.`;
      exampleText = `${it1.quantity} ${it1.productName} (${formatCents(it1.subtotalCents)}) + ${
        it2.quantity
      } ${it2.productName} (${formatCents(it2.subtotalCents)}) = ${formatCents(totalExpectedCents)}.`;
    } else {
      // Andamiaje bajo / Autonomía vocacional para Avanzado (3 productos)
      hintText = `Calcula de manera autónoma el subtotal de cada uno de los 3 productos solicitados (${lineItems
        .map((i) => `${i.quantity} ${i.productName}`)
        .join(', ')}). Luego suma los tres valores para obtener el total a cobrar.`;
      exampleText = `Suma los subtotales de cada producto: ${lineItems
        .map((i) => formatCents(i.subtotalCents))
        .join(' + ')} = ${formatCents(totalExpectedCents)}.`;
    }

    const generatedOrderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return {
      generatedOrderId,
      difficulty,
      lineItems,
      totalExpectedCents,
      paymentAmountCents,
      changeExpectedCents,
      instruction: customerSentence,
      audioInstruction,
      hintText,
      exampleText,
      generatedAt: new Date().toISOString(),
      degraded: isDegraded,
      degradationNotice,
    };
  }

  // Contingencia de seguridad
  const defaultP = activeProducts[0];
  const qty = 1;
  const total = defaultP.priceCents * qty;
  const tender = calculateTenderAmount(total, difficulty);

  return {
    generatedOrderId: `ORD-${Date.now()}-fallback`,
    difficulty,
    lineItems: [
      {
        productId: defaultP.id,
        productName: defaultP.name,
        visualKey: defaultP.visualKey,
        quantity: qty,
        unitPriceCents: defaultP.priceCents,
        subtotalCents: total,
      },
    ],
    totalExpectedCents: total,
    paymentAmountCents: tender,
    changeExpectedCents: tender - total,
    instruction: `Un cliente solicita ${formatProductRequestName(defaultP.name, qty)}.`,
    audioInstruction: `El cliente solicita ${formatProductRequestName(defaultP.name, qty)}.`,
    hintText: `Busca ${defaultP.name} y selecciona ${qty} unidad.`,
    exampleText: `1 unidad de ${defaultP.name} cuesta ${formatCents(defaultP.priceCents)}.`,
    generatedAt: new Date().toISOString(),
    degraded: isDegraded || activeProducts.length < exactTargetDistinct,
    degradationNotice,
  };
}
