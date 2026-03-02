/**
 * Landing page bán trà Tân Cương – Google Apps Script
 * doGet: getProducts, getProductBySlug, getOrderStatus
 * doPost: createOrder, webhook PayOS
 * Menu: ⚡ Quản lý Shop (Seed, Confirm Webhook, Update cache)
 */

var CACHE_TTL_SECONDS = 180; // 3 phút
var CACHE_KEY_PRODUCTS = 'products';
var RATE_LIMIT_COUNT = 5;
var RATE_LIMIT_WINDOW_SEC = 60;
var LOCK_WAIT_MS = 15000;
var PAYMENT_EXPIRE_MINUTES = 30;
var BODY_MAX_BYTES = 10 * 1024;
var MAX_ITEMS = 20;

// ——— Sheets ———
function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getOrCreateSheet(name, headers) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  return sheet;
}

function getProductsSheet() {
  return getOrCreateSheet('Products', [
    'id', 'name', 'slug', 'category', 'tags', 'price', 'salePrice', 'saleEndDate',
    'images', 'thumbnail', 'description', 'specs', 'features', 'stock', 'sku', 'isFeatured'
  ]);
}

function getOrdersSheet() {
  return getOrCreateSheet('Orders', [
    'orderCode', 'customerName', 'phone', 'email', 'address', 'items', 'totalAmount',
    'payosPaymentId', 'payosTransactionId', 'status', 'createdAt', 'updatedAt', 'webhookRawLog'
  ]);
}

function getConfigSheet() {
  return getOrCreateSheet('Config', ['LATEST_ORDER_ID', 'counter']);
}

function getWebhookLogsSheet() {
  return getOrCreateSheet('WebhookLogs', ['rawBody', 'computedSignature', 'receivedSignature', 'error', 'timestamp']);
}

// ——— Config ———
function getOrderCounter() {
  var sheet = getConfigSheet();
  var data = sheet.getRange('A1:B1').getValues();
  if (!data[0][1] || data[0][1] === '') {
    sheet.getRange('A1').setValue('LATEST_ORDER_ID');
    sheet.getRange('B1').setValue(1000);
    return 1000;
  }
  return Number(data[0][1]);
}

function setOrderCounter(value) {
  getConfigSheet().getRange('B1').setValue(value);
}

// ——— Script Properties ———
function getProp(key) {
  return PropertiesService.getScriptProperties().getProperty(key);
}

// ——— Helpers ———
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function parseBody(e) {
  try {
    var body = e.postData && e.postData.contents ? e.postData.contents : null;
    return body ? JSON.parse(body) : {};
  } catch (err) {
    return {};
  }
}

function isSalePriceActive(saleEndDateStr) {
  if (!saleEndDateStr) return false;
  try {
    var d = new Date(saleEndDateStr);
    return d.getTime() > new Date().getTime();
  } catch (e) {
    return false;
  }
}

function rowToProduct(row, headers) {
  var tags = [];
  try { tags = row[4] ? JSON.parse(row[4]) : []; } catch (e) {}
  var images = [];
  try { images = row[8] ? JSON.parse(row[8]) : []; } catch (e) {}
  var specs = [];
  try { specs = row[11] ? JSON.parse(row[11]) : []; } catch (e) {}
  var features = [];
  try { features = row[12] ? JSON.parse(row[12]) : []; } catch (e) {}
  return {
    id: String(row[0]),
    name: String(row[1]),
    slug: String(row[2]),
    category: String(row[3]),
    tags: tags,
    price: Number(row[5]),
    salePrice: row[6] !== '' && row[6] !== undefined ? Number(row[6]) : null,
    saleEndDate: row[7] !== '' ? String(row[7]) : null,
    images: images,
    thumbnail: row[9] !== '' ? String(row[9]) : null,
    description: row[10] !== '' ? String(row[10]) : null,
    specs: specs,
    features: features,
    stock: Number(row[13]) || 0,
    sku: row[14] !== '' ? String(row[14]) : null,
    isFeatured: row[15] === true || row[15] === 'TRUE' || row[15] === '1'
  };
}

function getEffectivePrice(product) {
  if (product.salePrice != null && isSalePriceActive(product.saleEndDate))
    return Number(product.salePrice);
  return Number(product.price);
}

// ——— Cache ———
function getCachedProducts() {
  var cache = CacheService.getScriptCache();
  var raw = cache.get(CACHE_KEY_PRODUCTS);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {}
  }
  return null;
}

function setCachedProducts(products) {
  CacheService.getScriptCache().put(CACHE_KEY_PRODUCTS, JSON.stringify(products), CACHE_TTL_SECONDS);
}

// ——— getProducts ———
function fetchProductsFromSheet() {
  var sheet = getProductsSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var data = sheet.getRange(2, 1, lastRow, 16).getValues();
  var headers = ['id','name','slug','category','tags','price','salePrice','saleEndDate','images','thumbnail','description','specs','features','stock','sku','isFeatured'];
  var list = [];
  for (var i = 0; i < data.length; i++) {
    var p = rowToProduct(data[i], headers);
    list.push(p);
  }
  return list;
}

function getProducts() {
  var cached = getCachedProducts();
  if (cached) return cached;
  var list = fetchProductsFromSheet();
  setCachedProducts(list);
  return list;
}

function getProductBySlug(slug) {
  var list = getCachedProducts();
  if (!list) list = fetchProductsFromSheet();
  for (var i = 0; i < list.length; i++) {
    if (list[i].slug === slug) return list[i];
  }
  return null;
}

function getProductById(id) {
  var list = getCachedProducts();
  if (!list) list = fetchProductsFromSheet();
  for (var i = 0; i < list.length; i++) {
    if (String(list[i].id) === String(id)) return list[i];
  }
  return null;
}

// ——— getOrderStatus ———
function getOrderStatus(orderCode) {
  var code = parseInt(orderCode, 10);
  if (isNaN(code) || code < 1) {
    return { success: false, error: 'Invalid orderCode' };
  }
  var sheet = getOrdersSheet();
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (Number(data[i][0]) === code) {
      return {
        success: true,
        data: {
          orderCode: code,
          status: String(data[i][9]),
          totalAmount: Number(data[i][6])
        }
      };
    }
  }
  return { success: false, error: 'Order not found' };
}

// ——— Rate limit ———
function checkRateLimit(phone, email) {
  var key = 'rateLimit_' + String(phone) + '_' + String(email);
  var cache = CacheService.getScriptCache();
  var raw = cache.get(key);
  var count = raw ? parseInt(raw, 10) : 0;
  if (count >= RATE_LIMIT_COUNT) return false;
  cache.put(key, String(count + 1), RATE_LIMIT_WINDOW_SEC);
  return true;
}

// ——— Validate ———
function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  var digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
}

function validateCreateOrder(body) {
  if (body.website !== undefined && body.website !== null && String(body.website).trim() !== '')
    return { ok: false, error: 'Invalid request' };
  var name = body.customerName;
  var phone = body.phone;
  var email = body.email;
  var address = body.address;
  var items = body.items;
  if (!name || typeof name !== 'string' || name.trim().length === 0)
    return { ok: false, error: 'Thiếu tên khách hàng' };
  if (!validatePhone(phone))
    return { ok: false, error: 'Số điện thoại không hợp lệ (10-11 số)' };
  if (!validateEmail(email))
    return { ok: false, error: 'Email không hợp lệ' };
  if (!address || typeof address !== 'string' || address.trim().length === 0)
    return { ok: false, error: 'Thiếu địa chỉ' };
  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_ITEMS)
    return { ok: false, error: 'Giỏ hàng không hợp lệ' };
  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    if (!it.id || !(it.quantity > 0))
      return { ok: false, error: 'Sản phẩm hoặc số lượng không hợp lệ' };
  }
  return { ok: true };
}

// ——— PayOS ———
function createPayOSLink(orderCode, amount, description) {
  var clientId = getProp('PAYOS_CLIENT_ID');
  var apiKey = getProp('PAYOS_API_KEY');
  var checksumKey = getProp('PAYOS_CHECKSUM_KEY');
  var frontendUrl = getProp('FRONTEND_URL');
  if (!clientId || !apiKey || !checksumKey || !frontendUrl) {
    return { ok: false, error: 'PAYOS_CONFIG_ERROR' };
  }
  var desc = (description || 'Don hang #' + orderCode).substring(0, 25);
  var returnUrl = frontendUrl.replace(/\/$/, '') + '/order-success?orderCode=' + orderCode;
  var cancelUrl = frontendUrl.replace(/\/$/, '') + '/payment-failed?orderCode=' + orderCode;
  var expiredAt = Math.floor(Date.now() / 1000) + PAYMENT_EXPIRE_MINUTES * 60;

  var signData = 'amount=' + amount + '&cancelUrl=' + cancelUrl + '&description=' + desc + '&orderCode=' + orderCode + '&returnUrl=' + returnUrl;
  var signature = Utilities.computeHmacSha256Signature(signData, checksumKey);
  var sigHex = signature.map(function(b) { return ('0' + (b < 0 ? b + 256 : b).toString(16)).slice(-2); }).join('');

  var payload = {
    amount: amount,
    orderCode: orderCode,
    description: desc,
    returnUrl: returnUrl,
    cancelUrl: cancelUrl,
    expiredAt: expiredAt,
    signature: sigHex
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    headers: { 'x-client-id': clientId, 'x-api-key': apiKey },
    muteHttpExceptions: true
  };

  try {
    var resp = UrlFetchApp.fetch('https://api-merchant.payos.vn/v2/payment-requests', options);
    var code = resp.getResponseCode();
    var json = JSON.parse(resp.getContentText());
    if (code >= 200 && code < 300 && json.code === '00' && json.data && json.data.checkoutUrl)
      return { ok: true, checkoutUrl: json.data.checkoutUrl };
    if (code === 401) return { ok: false, error: 'PAYOS_AUTH_ERROR' };
    if (code === 429) return { ok: false, error: 'PAYOS_RATE_LIMIT' };
    return { ok: false, error: json.desc || 'PAYOS_CREATE_LINK_FAILED' };
  } catch (e) {
    return { ok: false, error: 'PAYOS_TIMEOUT' };
  }
}

// ——— createOrder (trong Lock) ———
function createOrderLocked(body) {
  var validation = validateCreateOrder(body);
  if (!validation.ok)
    return { success: false, error: validation.error };

  if (!checkRateLimit(body.phone, body.email))
    return { success: false, error: 'Vui lòng đợi 1 phút rồi thử lại.' };

  var expectedTotal = Number(body.expectedTotal);
  var items = body.items;
  var updatedItems = [];
  var actualTotal = 0;

  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    var product = getProductById(it.id);
    if (!product)
      return { success: false, error: 'Sản phẩm không tồn tại: ' + it.id };
    var qty = parseInt(it.quantity, 10) || 0;
    if (qty < 1)
      return { success: false, error: 'Số lượng không hợp lệ' };
    if (Number(product.stock) < qty)
      return { success: false, error: 'Sản phẩm "' + product.name + '" không đủ tồn kho' };
    var unitPrice = getEffectivePrice(product);
    var lineTotal = unitPrice * qty;
    actualTotal += lineTotal;
    updatedItems.push({
      id: product.id,
      name: product.name,
      quantity: qty,
      unitPrice: unitPrice,
      total: lineTotal
    });
  }

  if (Math.abs(actualTotal - expectedTotal) > 1) {
    return {
      success: false,
      error: 'PRICE_CHANGED',
      data: { updatedItems: updatedItems, actualTotal: actualTotal }
    };
  }

  var orderCode = getOrderCounter() + 1;
  setOrderCounter(orderCode);

  var payos = createPayOSLink(orderCode, Math.round(actualTotal), 'Tra Tan Cuong #' + orderCode);
  if (!payos.ok)
    return { success: false, error: payos.error || 'Tạo link thanh toán thất bại' };

  var orderRow = [
    orderCode,
    String(body.customerName).trim(),
    String(body.phone).trim(),
    String(body.email).trim(),
    String(body.address).trim(),
    JSON.stringify(updatedItems),
    actualTotal,
    '',
    '',
    'PENDING',
    new Date().toISOString(),
    new Date().toISOString(),
    ''
  ];

  var ordersSheet = getOrdersSheet();
  ordersSheet.appendRow(orderRow);

  var lastRow = ordersSheet.getLastRow();
  var writtenCode = ordersSheet.getRange(lastRow, 1).getValue();
  if (Number(writtenCode) !== orderCode)
    return { success: false, error: 'Ghi đơn vào Sheet thất bại, vui lòng thử lại.' };

  return {
    success: true,
    data: { orderCode: orderCode, checkoutUrl: payos.checkoutUrl }
  };
}

// ——— Webhook ———
function verifyWebhookSignature(body) {
  var received = body.signature;
  var data = body.data;
  if (!data || !received) return false;
  var checksumKey = getProp('PAYOS_CHECKSUM_KEY');
  if (!checksumKey) return false;
  var keys = Object.keys(data).sort();
  var parts = [];
  for (var i = 0; i < keys.length; i++) {
    var v = data[keys[i]];
    parts.push(keys[i] + '=' + (v === null || v === undefined ? '' : v));
  }
  var signStr = parts.join('&');
  var sig = Utilities.computeHmacSha256Signature(signStr, checksumKey);
  var sigHex = sig.map(function(b) { return ('0' + (b < 0 ? b + 256 : b).toString(16)).slice(-2); }).join('');
  return sigHex === received;
}

function findOrderByCode(orderCode) {
  var sheet = getOrdersSheet();
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (Number(data[i][0]) === orderCode) return { rowIndex: i + 1, data: data[i] };
  }
  return null;
}

function updateOrderToPaid(orderCode, transactionId, webhookRawLog) {
  var sheet = getOrdersSheet();
  var found = findOrderByCode(orderCode);
  if (!found) return;
  var row = found.rowIndex;
  var rowData = found.data;
  var status = rowData[9];
  if (status === 'PAID') return;

  var items = [];
  try { items = JSON.parse(rowData[5]); } catch (e) {}
  var productSheet = getProductsSheet();
  var prodData = productSheet.getDataRange().getValues();
  for (var k = 0; k < items.length; k++) {
    var it = items[k];
    var pid = it.id;
    var qty = it.quantity || 0;
    for (var r = 1; r < prodData.length; r++) {
      if (String(prodData[r][0]) === String(pid)) {
        var currentStock = Number(prodData[r][13]) || 0;
        productSheet.getRange(r + 1, 14).setValue(Math.max(0, currentStock - qty));
        break;
      }
    }
  }

  sheet.getRange(row, 9).setValue(transactionId || '');
  sheet.getRange(row, 10).setValue('PAID');
  sheet.getRange(row, 12).setValue(new Date().toISOString());
  sheet.getRange(row, 13).setValue(webhookRawLog || '');
}

function handleWebhook(body) {
  if (!body.code || !body.data || body.signature === undefined) {
    getWebhookLogsSheet().appendRow([JSON.stringify(body), '', '', 'Missing code/data/signature', new Date().toISOString()]);
    return;
  }
  var computed = '';
  try {
    var keys = Object.keys(body.data).sort();
    var parts = [];
    for (var i = 0; i < keys.length; i++) {
      var v = body.data[keys[i]];
      parts.push(keys[i] + '=' + (v === null || v === undefined ? '' : v));
    }
    var signStr = parts.join('&');
    var sig = Utilities.computeHmacSha256Signature(signStr, getProp('PAYOS_CHECKSUM_KEY') || '');
    computed = sig.map(function(b) { return ('0' + (b < 0 ? b + 256 : b).toString(16)).slice(-2); }).join('');
  } catch (e) {}
  if (!verifyWebhookSignature(body)) {
    getWebhookLogsSheet().appendRow([JSON.stringify(body), computed, body.signature || '', 'Invalid signature', new Date().toISOString()]);
    return;
  }
  if (body.code !== '00' || body.success !== true) return;

  var orderCode = body.data.orderCode != null ? parseInt(body.data.orderCode, 10) : null;
  if (!orderCode) return;
  var transactionId = body.data.reference || body.data.transactionId || body.data.id || '';

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(LOCK_WAIT_MS);
    updateOrderToPaid(orderCode, transactionId, JSON.stringify(body));
  } finally {
    lock.releaseLock();
  }
}

// ——— doGet ———
function doGet(e) {
  var action = (e.parameter && e.parameter.action) || '';
  var result = { success: false, error: 'Unknown action' };

  if (action === 'getProducts') {
    try {
      var list = getProducts();
      return jsonResponse({ success: true, data: list });
    } catch (err) {
      return jsonResponse({ success: false, error: String(err.message) });
    }
  }

  if (action === 'getProductBySlug') {
    var slug = (e.parameter && e.parameter.slug) || '';
    var product = getProductBySlug(slug);
    if (product)
      return jsonResponse({ success: true, data: product });
    return jsonResponse({ success: false, error: 'Not found' });
  }

  if (action === 'getOrderStatus') {
    var orderCode = (e.parameter && e.parameter.orderCode) || '';
    var statusRes = getOrderStatus(orderCode);
    return jsonResponse(statusRes);
  }

  return jsonResponse(result);
}

// ——— doPost ———
function doPost(e) {
  var rawContent = e.postData && e.postData.contents ? e.postData.contents : '';
  if (rawContent.length > BODY_MAX_BYTES)
    return jsonResponse({ success: false, error: 'Payload too large' });

  var body = {};
  try {
    body = JSON.parse(rawContent);
  } catch (err) {
    return jsonResponse({ success: false, error: 'Invalid JSON' });
  }

  // Webhook PayOS
  if (body.code !== undefined && body.data !== undefined && body.signature !== undefined) {
    handleWebhook(body);
    return jsonResponse({ success: true });
  }

  // createOrder
  if (body.action === 'createOrder') {
    var lock = LockService.getScriptLock();
    try {
      lock.waitLock(LOCK_WAIT_MS);
      var createResult = createOrderLocked(body);
      return jsonResponse(createResult);
    } catch (err) {
      return jsonResponse({ success: false, error: String(err.message) });
    } finally {
      lock.releaseLock();
    }
  }

  return jsonResponse({ success: false, error: 'Unknown action' });
}

// ——— Menu ⚡ Quản lý Shop ———
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('⚡ Quản lý Shop')
    .addItem('Khởi tạo dữ liệu mẫu', 'menuSeedData')
    .addItem('Xác thực Webhook PayOS', 'menuConfirmWebhook')
    .addItem('Update lại cache', 'menuUpdateCache')
    .addToUi();
}

function menuUpdateCache() {
  CacheService.getScriptCache().remove(CACHE_KEY_PRODUCTS);
  SpreadsheetApp.getUi().alert('Đã xóa cache sản phẩm. Lần xem tiếp sẽ lấy dữ liệu mới từ Sheet.');
}

function menuConfirmWebhook() {
  var url = getProp('HOOKDECK_SOURCE_URL');
  if (!url) {
    SpreadsheetApp.getUi().alert('Chưa cấu hình HOOKDECK_SOURCE_URL trong Script Properties.');
    return;
  }
  var clientId = getProp('PAYOS_CLIENT_ID');
  var apiKey = getProp('PAYOS_API_KEY');
  if (!clientId || !apiKey) {
    SpreadsheetApp.getUi().alert('Chưa cấu hình PAYOS_CLIENT_ID hoặc PAYOS_API_KEY.');
    return;
  }
  var result = confirmPayOSWebhook(url, clientId, apiKey);
  if (result.ok) {
    SpreadsheetApp.getUi().alert('Xác thực webhook thành công!\n\nURL đã đăng ký:\n' + url);
  } else {
    SpreadsheetApp.getUi().alert('Lỗi: ' + result.error + '\n\nURL cần đăng ký (có thể dán thủ công vào PayOS):\n' + url);
  }
}

function confirmPayOSWebhook(webhookUrl, clientId, apiKey) {
  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-client-id': clientId, 'x-api-key': apiKey },
    payload: JSON.stringify({ webhookUrl: webhookUrl }),
    muteHttpExceptions: true
  };
  try {
    var resp = UrlFetchApp.fetch('https://api-merchant.payos.vn/confirm-webhook', options);
    var code = resp.getResponseCode();
    var json = JSON.parse(resp.getContentText());
    if (code >= 200 && code < 300 && json.code === '00')
      return { ok: true };
    return { ok: false, error: json.desc || json.error || resp.getContentText() };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function menuSeedData() {
  var sheet = getProductsSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    var confirm = SpreadsheetApp.getUi().alert('Sheet Products đã có dữ liệu. Bạn có muốn ghi đè bằng dữ liệu mẫu?', SpreadsheetApp.getUi().ButtonSet.YES_NO);
    if (confirm !== SpreadsheetApp.getUi().Button.YES) return;
    sheet.clearContents();
    sheet.getRange(1, 1, 1, 16).setValues([['id', 'name', 'slug', 'category', 'tags', 'price', 'salePrice', 'saleEndDate', 'images', 'thumbnail', 'description', 'specs', 'features', 'stock', 'sku', 'isFeatured']]);
  }
  var seed = getSeedProducts();
  for (var i = 0; i < seed.length; i++) {
    sheet.appendRow(seed[i]);
  }
  CacheService.getScriptCache().remove(CACHE_KEY_PRODUCTS);
  SpreadsheetApp.getUi().alert('Đã khởi tạo ' + seed.length + ' sản phẩm mẫu.');
}

// Seed: Trà Tân Cương, giá < 20.000 VND để test. Category: TRA_TAN_CUONG_XANH, COMBO_2_GOI, COMBO_5_GOI
function getSeedProducts() {
  var now = new Date();
  var saleEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  var saleEndStr = saleEnd.toISOString().split('T')[0];
  return [
    ['1', 'Trà Tân Cương Xanh', 'tra-tan-cuong-xanh', 'TRA_TAN_CUONG_XANH', '["Trà xanh","Hàng mới"]', 15000, 12000, saleEndStr, '[]', 'https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?w=400', 'Trà nõn tôm Tân Cương 500g, đóng gói hút chân không.', '[]', '[]', 100, 'TN500', false],
    ['2', 'Combo 2 gói', 'combo-2-goi', 'COMBO_2_GOI', '["Trà xanh","Bán chạy","Giảm giá"]', 18000, 15000, saleEndStr, '[]', 'https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?w=400', 'Combo 2 hộp 500g, tiết kiệm hơn.', '[]', '[]', 80, 'TT1K', true],
    ['3', 'Combo 5 gói', 'combo-5-goi', 'COMBO_5_GOI', '["Trà xanh","Giảm giá"]', 20000, 18000, saleEndStr, '[]', 'https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?w=400', 'Combo 5 hộp, giá sỉ, quà biếu.', '[]', '[]', 50, 'TA25', false]
  ];
}
