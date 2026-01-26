// ... (начало файла без изменений)
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentId++;
    const product: Product = { 
      ...insertProduct, 
      id,
      sku: insertProduct.sku ?? "",
      description: insertProduct.description ?? "",
      additional_photos: insertProduct.additional_photos ?? [],
      pairs_per_box: insertProduct.pairs_per_box ?? "" // Добавляем обработку нового поля
    };
    this.products.set(id, product);
    return product;
  }
// ...
