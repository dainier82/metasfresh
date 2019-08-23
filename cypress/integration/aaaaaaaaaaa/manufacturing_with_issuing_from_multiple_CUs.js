/*
 * #%L
 * metasfresh-e2e
 * %%
 * Copyright (C) 2019 metas GmbH
 * %%
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as
 * published by the Free Software Foundation, either version 2 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public
 * License along with this program. If not, see
 * <http://www.gnu.org/licenses/gpl-2.0.html>.
 * #L%
 */

import { Product, ProductCategory } from '../../support/utils/product';
import { appendHumanReadableNow } from '../../support/utils/utils';
import { BillOfMaterial, BillOfMaterialLine } from '../../support/utils/billOfMaterial';
import { Builder } from '../../support/utils/builder';

//
let categoryName1 = appendHumanReadableNow('Category1');
let categoryName2 = appendHumanReadableNow('Category2');
let productComponentName1 = appendHumanReadableNow('ProductComponent1');
let productComponentName2 = appendHumanReadableNow('ProductComponent2');
let productComponentName3 = appendHumanReadableNow('ProductComponent3');
let productComponentQty1 = 25;
let productComponentQty2 = 20;
let productComponentQty3 = 50;
let productName = appendHumanReadableNow('Product1');
let huQty = 100;
const locatorId = 'Hauptlager_StdWarehouse_Hauptlager_0_0_0';
const bomIssueMethod = 'Issue only for what was received';

// test
let huValue1;
let huValue2;
let huValue3;

describe('Create test data', function() {
  it('Create product component 1', function() {
    cy.fixture('product/simple_productCategory.json').then(productCategoryJson => {
      Object.assign(new ProductCategory(), productCategoryJson)
        .setName(categoryName1)
        .apply();
    });

    cy.fixture('product/simple_product.json').then(productJson => {
      Object.assign(new Product(), productJson)
        .setName(productComponentName1)
        .setProductCategory(categoryName1)
        .apply();
    });
  });

  it('Create product component 2', function() {
    cy.fixture('product/simple_productCategory.json').then(productCategoryJson => {
      Object.assign(new ProductCategory(), productCategoryJson)
        .setName(categoryName2)
        .apply();
    });

    cy.fixture('product/simple_product.json').then(productJson => {
      Object.assign(new Product(), productJson)
        .setName(productComponentName2)
        .setProductCategory(categoryName2)
        .apply();
    });
  });

  it('Create product component 3', function() {
    cy.fixture('product/simple_product.json').then(productJson => {
      Object.assign(new Product(), productJson)
        .setName(productComponentName3)
        .setProductCategory(categoryName2)
        .apply();
    });
  });

  it('Create product', function() {
    cy.fixture('product/simple_product.json').then(productJson => {
      Object.assign(new Product(), productJson)
        .setName(productName)
        .setProductCategory(categoryName1)
        .apply();
    });
  });

  it('Create a BOM for the product', function() {
    cy.fixture('product/bill_of_material.json').then(billMaterialJson => {
      Object.assign(new BillOfMaterial(), billMaterialJson)
        .setProduct(productName)
        // eslint-disable-next-line
        .addLine(new BillOfMaterialLine().setProduct(productComponentName1).setQuantity(productComponentQty1).setIssueMethod(bomIssueMethod))
        // eslint-disable-next-line
        .addLine(new BillOfMaterialLine().setProduct(productComponentName2).setQuantity(productComponentQty2).setIssueMethod(bomIssueMethod))
        // eslint-disable-next-line
        .addLine(new BillOfMaterialLine().setProduct(productComponentName3).setQuantity(productComponentQty3).setIssueMethod(bomIssueMethod))
        .apply();
    });
  });

  it('Create 3 HUs', function() {
    Builder.createHUWithStock(productComponentName1, huQty, locatorId).then(huVal => (huValue1 = huVal));
    Builder.createHUWithStock(productComponentName2, huQty, locatorId).then(huVal => (huValue2 = huVal));
    Builder.createHUWithStock(productComponentName3, huQty, locatorId).then(huVal => (huValue3 = huVal));
  });
});

describe('Create Manufacturing Order', function() {
  it('eeeeeeeeeeeeeeeeeeeeeee', function() {

  });

});
