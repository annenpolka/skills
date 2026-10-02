from decimal import ROUND_HALF_UP, Decimal

TAX_RATE = Decimal("0.10")
MINOR_UNIT_EXPONENT = {"JPY": 0, "USD": 2}


def with_tax_minor_units(price: Decimal, currency: str) -> int:
    """税込額を通貨の最小単位の整数で返す（JPY=円、USD=セント）。"""
    exponent = MINOR_UNIT_EXPONENT[currency]
    taxed = (price * (1 + TAX_RATE)).quantize(Decimal(1).scaleb(-exponent), rounding=ROUND_HALF_UP)
    return int(taxed.scaleb(exponent))
