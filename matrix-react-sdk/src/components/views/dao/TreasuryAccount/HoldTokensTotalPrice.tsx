import React from 'react';
import { useTotalTreasuryPrice } from "../../../../hooks/useTotalTreasuryPrice"

const HoldTokensTotalPrice = () => {
  const { totalPriceFormatted } = useTotalTreasuryPrice()
  return totalPriceFormatted ? (
    <div className="mx_HoldTokensTotalPrice">
      <p className="mx_HoldTokensTotalPrice_title">Treasury Balance</p>
      <span className="mx_HoldTokensTotalPrice_price">${totalPriceFormatted}</span>
    </div>
  ) : null
}

export default HoldTokensTotalPrice
