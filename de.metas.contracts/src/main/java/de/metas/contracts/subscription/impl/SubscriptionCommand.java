package de.metas.contracts.subscription.impl;

import java.sql.Timestamp;
import java.util.List;

import org.adempiere.util.Loggables;
import org.adempiere.util.Services;
import org.compiere.util.Env;

import de.metas.contracts.model.I_C_Flatrate_Term;
import de.metas.contracts.model.I_C_SubscriptionProgress;
import de.metas.contracts.subscription.ISubscriptionDAO;
import de.metas.contracts.subscription.ISubscriptionDAO.SubscriptionProgressQuery;
import de.metas.contracts.subscription.impl.subscriptioncommands.ChangeRecipient;
import de.metas.contracts.subscription.impl.subscriptioncommands.InsertPause;
import de.metas.contracts.subscription.impl.subscriptioncommands.RemovePauses;
import de.metas.i18n.IMsgBL;
import lombok.Builder.Default;
import lombok.NonNull;

/*
 * #%L
 * de.metas.contracts
 * %%
 * Copyright (C) 2017 metas GmbH
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

public class SubscriptionCommand
{
	public static final String MSG_NO_SPS_AFTER_DATE_1P = "Subscription.NoSpsAfterDate_1P";

	public static SubscriptionCommand get()
	{
		return new SubscriptionCommand();
	}

	private SubscriptionCommand()
	{
	}

	public void insertPause(
			@NonNull final I_C_Flatrate_Term term,
			@NonNull final Timestamp pauseFrom,
			@NonNull final Timestamp pauseUntil)
	{
		new InsertPause(this).insertPause(term, pauseFrom, pauseUntil);
	}

	public static int changeRecipient(@NonNull final ChangeRecipientsRequest changeRecipientsRequest)
	{
		return ChangeRecipient.changeRecipient(changeRecipientsRequest);
	}

	@lombok.Builder
	@lombok.Value
	public static final class ChangeRecipientsRequest
	{
		@NonNull
		I_C_Flatrate_Term term;

		@NonNull
		Timestamp dateFrom;

		@NonNull
		Timestamp dateTo;

		@NonNull
		Integer DropShip_BPartner_ID;

		@NonNull
		Integer DropShip_Location_ID;

		@Default
		Integer DropShip_User_ID = 0;
	}

	public void removePauses(
			@NonNull final I_C_Flatrate_Term term,
			@NonNull final Timestamp pauseFrom,
			@NonNull final Timestamp pauseUntil)
	{
		new RemovePauses(this).removePauses(term, pauseFrom, pauseUntil);
	}
	
	public final List<I_C_SubscriptionProgress> retrieveNextSPsAndLogIfEmpty(
			@NonNull final I_C_Flatrate_Term term,
			@NonNull final Timestamp pauseFrom)
	{
		final ISubscriptionDAO subscriptionDAO = Services.get(ISubscriptionDAO.class);
		final SubscriptionProgressQuery query = SubscriptionProgressQuery.builder()
				.term(term)
				.eventDateNotBefore(pauseFrom)
				.build();

		final List<I_C_SubscriptionProgress> sps = subscriptionDAO.retrieveSubscriptionProgresses(query);
		if (sps.isEmpty())
		{
			final IMsgBL msgBL = Services.get(IMsgBL.class);
			Loggables.get().addLog(msgBL.getMsg(Env.getCtx(), MSG_NO_SPS_AFTER_DATE_1P, new Object[] { pauseFrom }));
		}
		return sps;
	}
}
