package org.eevolution.api;

import java.time.Instant;

import javax.annotation.Nullable;

import org.adempiere.mm.attributes.AttributeSetInstanceId;
import org.adempiere.warehouse.WarehouseId;
import org.eevolution.api.PPOrderCreateRequest.PPOrderCreateRequestBuilder;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder;

import de.metas.bpartner.BPartnerId;
import de.metas.material.event.pporder.MaterialDispoGroupId;
import de.metas.material.planning.ProductPlanningId;
import de.metas.order.OrderLineId;
import de.metas.organization.ClientAndOrgId;
import de.metas.product.ProductId;
import de.metas.product.ResourceId;
import de.metas.quantity.Quantity;
import de.metas.user.UserId;
import de.metas.util.Check;
import lombok.Builder;
import lombok.NonNull;
import lombok.Value;

/*
 * #%L
 * de.metas.adempiere.libero.libero
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

@Value
@JsonDeserialize(builder = PPOrderCreateRequestBuilder.class)
public class PPOrderCreateRequest
{
	ClientAndOrgId clientAndOrgId;
	ProductPlanningId productPlanningId;
	MaterialDispoGroupId materialDispoGroupId;
	ResourceId plantId;
	WarehouseId warehouseId;
	UserId plannerId;

	ProductBOMId bomId;
	ProductId productId;
	AttributeSetInstanceId attributeSetInstanceId;
	Quantity qtyRequired;

	Instant dateOrdered;
	Instant datePromised;
	Instant dateStartSchedule;

	OrderLineId salesOrderLineId;
	BPartnerId customerId;

	Boolean completeDocument;

	@Builder
	PPOrderCreateRequest(
			@NonNull final ClientAndOrgId clientAndOrgId,
			@Nullable final ProductPlanningId productPlanningId,
			@Nullable final MaterialDispoGroupId materialDispoGroupId,
			@NonNull final ResourceId plantId,
			@NonNull final WarehouseId warehouseId,
			@Nullable final UserId plannerId,
			//
			@Nullable ProductBOMId bomId,
			@NonNull ProductId productId,
			@Nullable AttributeSetInstanceId attributeSetInstanceId,
			@NonNull Quantity qtyRequired,
			//
			@NonNull Instant dateOrdered,
			@NonNull Instant datePromised,
			@NonNull final Instant dateStartSchedule,
			//
			@Nullable final OrderLineId salesOrderLineId,
			@Nullable final BPartnerId customerId,
			//
			final boolean pickingOrder,
			//
			@Nullable final Boolean completeDocument)
	{
		Check.assume(!qtyRequired.isZero(), "qtyRequired shall not be zero");

		this.clientAndOrgId = clientAndOrgId;
		this.productPlanningId = productPlanningId;
		this.materialDispoGroupId = materialDispoGroupId;
		this.plantId = plantId;
		this.warehouseId = warehouseId;
		this.plannerId = plannerId;

		this.bomId = bomId;
		this.productId = productId;
		this.attributeSetInstanceId = attributeSetInstanceId != null ? attributeSetInstanceId : AttributeSetInstanceId.NONE;
		this.qtyRequired = qtyRequired;

		this.dateOrdered = dateOrdered;
		this.datePromised = datePromised;
		this.dateStartSchedule = dateStartSchedule;

		this.salesOrderLineId = salesOrderLineId;
		this.customerId = customerId;

		this.completeDocument = completeDocument;
	}

	@JsonPOJOBuilder(withPrefix = "")
	public static class PPOrderCreateRequestBuilder
	{
	}
}