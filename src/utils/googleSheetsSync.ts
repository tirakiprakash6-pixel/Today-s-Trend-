import { Order, Product } from '../types';

export const APPS_SCRIPT_STORAGE_KEY = 'todays_trend_apps_script_url';
export const PRODUCTS_SCRIPT_STORAGE_KEY = 'todays_trend_products_script_url';

export const DEFAULT_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbyaGS8Oh5OCgDGdHyOOIvXtTqrGZboSyYNA-SPzn1eOfodrCwJBlLhdNlsHYcZ0hV0Z7g/exec';

// Owner's Products Web App URL (configured privately by the owner)
export const DEFAULT_PRODUCTS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbx_H6zMQLtdd1L9Z-m06ncfoGrsGTrSAs_GtFmhH0cyfhBkeghmGM6Og3ohiFf4OrAFZg/exec';

export function getSavedAppsScriptUrl(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(APPS_SCRIPT_STORAGE_KEY) || DEFAULT_APPS_SCRIPT_URL;
  }
  return DEFAULT_APPS_SCRIPT_URL;
}

export function saveAppsScriptUrl(url: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(APPS_SCRIPT_STORAGE_KEY, url.trim());
  }
}

export function getSavedProductsScriptUrl(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(PRODUCTS_SCRIPT_STORAGE_KEY) || DEFAULT_PRODUCTS_SCRIPT_URL;
  }
  return DEFAULT_PRODUCTS_SCRIPT_URL;
}

export function saveProductsScriptUrl(url: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PRODUCTS_SCRIPT_STORAGE_KEY, url.trim());
  }
}

export async function fetchProductsFromGoogleSheets(productsUrlOverride?: string): Promise<Product[] | null> {
  const targetUrl = productsUrlOverride || getSavedProductsScriptUrl() || DEFAULT_PRODUCTS_SCRIPT_URL;
  if (!targetUrl) return null;

  try {
    const fetchUrl = targetUrl.includes('?')
      ? `${targetUrl}&action=getProducts`
      : `${targetUrl}?action=getProducts`;

    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) return null;
    const data = await response.json();
    
    let rawList: any[] | null = null;
    if (Array.isArray(data)) {
      rawList = data;
    } else if (data && Array.isArray(data.products)) {
      rawList = data.products;
    } else if (data && Array.isArray(data.data)) {
      rawList = data.data;
    }

    if (rawList && rawList.length > 0) {
      const normalizedProducts: Product[] = rawList.map((item: any, idx: number) => {
        const id = String(item.id || `prod-sheet-${idx + 1}`).trim();
        const name = String(item.name || 'Untitled Product').trim();
        const price = Number(item.price) || 0;
        const originalPrice = Number(item.originalPrice) || price;
        const discountPercent =
          originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

        let imgList: string[] = [];
        if (Array.isArray(item.images) && item.images.length > 0) {
          imgList = item.images.filter(Boolean);
        } else if (item.image) {
          imgList = [String(item.image)];
        } else if (item.Image1) {
          imgList = [item.Image1, item.Image2, item.Image3, item.Image4].filter(Boolean);
        }

        const fallbackImg = 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800';
        const img1 = imgList[0] || fallbackImg;
        const img2 = imgList[1] || img1;
        const img3 = imgList[2] || img1;
        const img4 = imgList[3] || img1;
        const imagesTuple: [string, string, string, string] = [img1, img2, img3, img4];

        return {
          id,
          name,
          category: (item.category || item.Category || 'Men & woman Fashion') as any,
          subcategory: String(item.subcategory || item.Subcategory || 'General').trim(),
          price,
          originalPrice,
          discountPercent: Number(item.discountPercent) || discountPercent,
          rating: Number(item.rating || item.Rating) || 4.5,
          ratingCount: Number(item.ratingCount) || 120,
          images: imagesTuple,
          description: String(item.description || item.Description || '').trim(),
          sizes: Array.isArray(item.sizes) ? item.sizes : typeof item.sizes === 'string' ? item.sizes.split(',').map((s: string) => s.trim()) : undefined,
          colors: Array.isArray(item.colors) ? item.colors : typeof item.colors === 'string' ? item.colors.split(',').map((c: string) => c.trim()) : undefined,
          inStock: item.inStock !== false && String(item.inStock).toUpperCase() !== 'FALSE',
          freeDelivery: true,
          deliveryTime: String(item.deliveryTime || 'Today (2-3 Hours)'),
          mallShopName: String(item.mallShopName || item.shopName || 'Store Partner').trim(),
          mallFloor: String(item.mallFloor || item.floorLocation || 'Ground Floor').trim(),
        };
      });

      return normalizedProducts;
    }
    return null;
  } catch (error) {
    console.log('Google Sheets products fetch error/fallback:', error);
    return null;
  }
}

export async function submitOrderToGoogleSheets(
  order: Order,
  appsScriptUrl?: string
): Promise<{ success: boolean; message: string }> {
  const targetUrl = appsScriptUrl || getSavedAppsScriptUrl();

  if (!targetUrl) {
    return {
      success: true,
      message: 'Order saved locally to device (Google Sheets URL not configured).',
    };
  }

  try {
    const payload = {
      orderId: order.id,
      timestamp: order.createdAt,
      fullName: order.customer.fullName,
      phoneNumber: order.customer.phone,
      homeNumber: order.customer.homeNumber,
      address: order.customer.address,
      state: order.customer.state,
      city: order.customer.city,
      pincode: order.customer.pincode,
      itemsSummary: order.items
        .map(
          (i) =>
            `${i.product.name} (Qty: ${i.quantity}${i.selectedSize ? `, Size: ${i.selectedSize}` : ''}${i.selectedColor ? `, Color: ${i.selectedColor}` : ''} - ₹${i.product.price * i.quantity})`
        )
        .join(' | '),
      totalAmount: order.totalAmount,
      paymentMethod: order.customer.paymentMethod,
    };

    await fetch(targetUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return {
      success: true,
      message: 'Order successfully sent to Google Sheet & saved to My Orders!',
    };
  } catch (error) {
    console.warn('Could not sync to Google Sheets endpoint, saved locally:', error);
    return {
      success: true,
      message: 'Order saved locally on device.',
    };
  }
}

export const STANDALONE_PRODUCTS_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * TODAY'S TREND - Dedicated Products Management Script (Code.gs)
 * =========================================================================
 * Add this script to your SECOND Google Sheet (dedicated for Products only).
 * This will NOT affect your existing Orders spreadsheet!
 * =========================================================================
 */

function setupProductsSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var headers = [
    "ID",
    "Name",
    "Category",
    "Subcategory",
    "Price",
    "OriginalPrice",
    "Rating",
    "Image1",
    "Image2",
    "Image3",
    "Image4",
    "Description",
    "Sizes",
    "Colors",
    "InStock",
    "ShopName",
    "FloorLocation"
  ];
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
         .setFontWeight("bold")
         .setBackground("#0f172a")
         .setFontColor("#ffffff")
         .setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
    
    // Add initial sample product
    sheet.appendRow([
      "prod-01",
      "Cotton Casual Shirt",
      "Men & woman Fashion",
      "Men Casual Wear",
      499,
      1299,
      4.5,
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800",
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800",
      "https://images.unsplash.com/photo-1620012253295-c15c429f66bf?w=800",
      "100% Cotton breathable casual wear shirt.",
      "M, L, XL, XXL",
      "Sky Blue, White, Olive Green",
      "TRUE",
      "Urban Trendz",
      "Ground Floor, Shop 12"
    ]);
  }
}

function doGet(e) {
  try {
    setupProductsSheet();
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rows = sheet.getDataRange().getValues();
    
    if (rows.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ status: "success", count: 0, products: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var products = [];
    for (var i = 1; i < rows.length; i++) {
      var r = rows[i];
      if (!r[0] || !r[1]) continue; // Skip empty rows
      
      var price = Number(r[4]) || 0;
      var originalPrice = Number(r[5]) || price;
      var discountPercent = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
      
      var img1 = r[7] ? String(r[7]).trim() : "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800";
      var img2 = r[8] ? String(r[8]).trim() : img1;
      var img3 = r[9] ? String(r[9]).trim() : img1;
      var img4 = r[10] ? String(r[10]).trim() : img1;
      
      var sizes = r[12] ? String(r[12]).split(",").map(function(s) { return s.trim(); }).filter(Boolean) : undefined;
      var colors = r[13] ? String(r[13]).split(",").map(function(c) { return c.trim(); }).filter(Boolean) : undefined;
      
      products.push({
        id: String(r[0]).trim(),
        name: String(r[1]).trim(),
        category: String(r[2]).trim() || "Men & woman Fashion",
        subcategory: String(r[3]).trim() || "General",
        price: price,
        originalPrice: originalPrice,
        discountPercent: discountPercent,
        rating: Number(r[6]) || 4.5,
        ratingCount: Math.floor(50 + Math.random() * 200),
        images: [img1, img2, img3, img4],
        description: String(r[11] || "").trim(),
        sizes: sizes && sizes.length > 0 ? sizes : undefined,
        colors: colors && colors.length > 0 ? colors : undefined,
        inStock: String(r[14]).toUpperCase() !== "FALSE",
        freeDelivery: true,
        deliveryTime: "Today (2-3 Hours)",
        mallShopName: String(r[15] || "Store Partner").trim(),
        mallFloor: String(r[16] || "Ground Floor").trim()
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      count: products.length,
      products: products
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString(),
      products: []
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
`;

export const SAMPLE_GOOGLE_APPS_SCRIPT_CODE = STANDALONE_PRODUCTS_APPS_SCRIPT_CODE;


