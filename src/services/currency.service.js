const prisma = require("../config/prisma");
const tenantContext = require("../utils/async-context");

class CurrencyService {
  _tenantId() {
    return tenantContext.getStore() || "default";
  }

  async getAllCurrencies(onlyActive = true) {
    const tenantId = this._tenantId();
    return await prisma.currency.findMany({
      where: { tenantId, ...(onlyActive ? { isActive: true } : {}) },
      orderBy: { code: "asc" },
    });
  }

  async getCurrencyByCode(code) {
    const tenantId = this._tenantId();
    return await prisma.currency.findFirst({
      where: { tenantId, code: code.toUpperCase() },
    });
  }

  async createCurrency(data) {
    const tenantId = this._tenantId();
    return await prisma.currency.create({
      data: {
        tenantId,
        code: data.code.toUpperCase(),
        symbol: data.symbol,
        exchangeRateToBase: parseFloat(data.exchangeRateToBase),
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }

  async updateCurrency(id, data) {
    const tenantId = this._tenantId();
    const existing = await prisma.currency.findFirst({
        where: { id: parseInt(id), tenantId }
    });

    if (!existing) {
        throw new Error("Currency not found or access denied");
    }

    const updateData = {};
    if (data.symbol) updateData.symbol = data.symbol;
    if (data.exchangeRateToBase !== undefined)
      updateData.exchangeRateToBase = parseFloat(data.exchangeRateToBase);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return await prisma.currency.update({
      where: { id: parseInt(id) },
      data: updateData,
    });
  }

  async deleteCurrency(id) {
    const tenantId = this._tenantId();
    // No permitir borrar si es la moneda base de StoreConfig
    const config = await prisma.storeConfig.findFirst({ where: { tenantId } });
    const currency = await prisma.currency.findFirst({
      where: { id: parseInt(id), tenantId },
    });

    if (currency && config && currency.code === config.baseCurrency) {
      throw new Error("Cannot delete the base currency");
    }

    return await prisma.currency.delete({
      where: { id: parseInt(id) },
    });
  }

  /**
   * Obtener el código de país del cliente basado en headers de IP (Vercel/CF)
   */
  getCountryByContext(req) {
    const testCountry = req.headers["x-test-country"];
    if (testCountry) return testCountry.toUpperCase();

    const clientCountry = req.headers["x-client-country"];
    if (clientCountry) return clientCountry.toUpperCase();

    const geoCountry =
      req.headers["x-vercel-ip-country"] || req.headers["cf-ipcountry"];
    if (geoCountry) return geoCountry.toUpperCase();

    return "";
  }

  /**
   * Determina la moneda a usar basado en el contexto (header o predeterminado).
   */
  async getCurrencyByContext(req) {
    const tenantId = this._tenantId();
    const config = await prisma.storeConfig.findFirst({ where: { tenantId } });
    const businessCountry = (config?.country || "").toUpperCase().trim();
    const baseCurrency = config?.baseCurrency || "USD";

    const countryCode = this.getCountryByContext(req);

    const isTest =
      req.headers["x-test-country"] || req.headers["x-client-country"];

    const headerCurrency = req.headers["x-currency"];
    if (headerCurrency && !isTest) {
      const exists = await this.getCurrencyByCode(headerCurrency);
      if (exists && exists.isActive) return exists.code;
    }

    if (countryCode) {
      const isOriginCountry =
        countryCode.toUpperCase() === businessCountry.toUpperCase();

      if (isOriginCountry) {
        return baseCurrency;
      }

      const secondaryCurrency = config.defaultCurrency || "USD";
      const secExists = await this.getCurrencyByCode(secondaryCurrency);
      if (secExists && secExists.isActive) return secondaryCurrency;
    }

    const fallbackCurrency = req.headers["x-currency"];
    if (fallbackCurrency) {
      const exists = await this.getCurrencyByCode(fallbackCurrency);
      if (exists && exists.isActive) return exists.code;
    }

    return baseCurrency;
  }

  /**
   * Responde si un país dado es el mismo que el país configurado en la tienda.
   */
  async isLocalCountry(countryCode) {
    if (!countryCode) return true;
    const tenantId = this._tenantId();
    const config = await prisma.storeConfig.findFirst({ where: { tenantId } });
    const businessCountry = (config?.country || "").toUpperCase().trim();
    const clientCountry = countryCode.toUpperCase().trim();

    return clientCountry === businessCountry;
  }
}

module.exports = new CurrencyService();

