"""
Unit Normalizer Engine
Converts mismatched units to canonical form before numeric comparison.
Supports: Financial (Cr/Lakh/Thousand), Power (kW/HP), Temperature (°C/°F),
          Volume (L/mL/m3), Distance (km/m/miles), Pressure (Bar/PSI/Pa)
"""
from typing import Optional, Tuple


class UnitNormalizer:

    # Financial units -> Crores (INR)
    FINANCIAL_TO_CR = {
        "cr": 1.0, "crore": 1.0, "crores": 1.0,
        "lakh": 0.01, "lakhs": 0.01, "lac": 0.01,
        "thousand": 0.0001, "k": 0.0001,
    }

    # Power units -> kW
    POWER_TO_KW = {
        "kw": 1.0, "kilowatt": 1.0, "kilowatts": 1.0,
        "hp": 0.7457, "horsepower": 0.7457, "bhp": 0.7457,
        "mw": 1000.0, "megawatt": 1000.0,
        "w": 0.001, "watt": 0.001,
    }

    # Pressure units -> Bar
    PRESSURE_TO_BAR = {
        "bar": 1.0, "bars": 1.0,
        "psi": 0.0689476,
        "pa": 0.00001, "kpa": 0.01, "mpa": 10.0,
        "atm": 1.01325,
    }

    # Volume units -> Liters
    VOLUME_TO_L = {
        "l": 1.0, "liter": 1.0, "liters": 1.0,
        "litre": 1.0, "litres": 1.0,
        "ml": 0.001, "milliliter": 0.001,
        "m3": 1000.0, "cubic meter": 1000.0,
        "gallon": 3.78541,
    }

    # Flow rate -> m3/hr
    FLOW_TO_M3HR = {
        "m3/hr": 1.0, "m3/h": 1.0,
        "lps": 3.6, "l/s": 3.6,
        "lpm": 0.06, "l/min": 0.06,
        "gpm": 0.2271, "cfm": 1.699,
    }

    # Production/quantity -> units/day
    PRODUCTION_UNITS = {"units/day", "units per day", "pcs/day", "pieces/day"}

    PERCENTAGE_UNITS = {"%", "percent", "percentage"}
    YEAR_UNITS = {"year", "years", "yr", "yrs"}

    @staticmethod
    def normalize(value: float, unit: str) -> Tuple[float, str]:
        """
        Normalize a value and unit to a canonical form.
        Returns (normalized_value, canonical_unit).
        """
        unit_lower = unit.strip().lower()

        if unit_lower in UnitNormalizer.FINANCIAL_TO_CR:
            return (value * UnitNormalizer.FINANCIAL_TO_CR[unit_lower], "Cr")
        if unit_lower in UnitNormalizer.POWER_TO_KW:
            return (value * UnitNormalizer.POWER_TO_KW[unit_lower], "kW")
        if unit_lower in UnitNormalizer.PRESSURE_TO_BAR:
            return (value * UnitNormalizer.PRESSURE_TO_BAR[unit_lower], "Bar")
        if unit_lower in UnitNormalizer.VOLUME_TO_L:
            return (value * UnitNormalizer.VOLUME_TO_L[unit_lower], "L")
        if unit_lower in UnitNormalizer.FLOW_TO_M3HR:
            return (value * UnitNormalizer.FLOW_TO_M3HR[unit_lower], "m3/hr")
        if unit_lower in UnitNormalizer.PERCENTAGE_UNITS:
            return (value, "%")
        if unit_lower in UnitNormalizer.YEAR_UNITS:
            return (value, "Years")
        if unit_lower in {"f", "degf", "fahrenheit"}:
            return ((value - 32) * 5 / 9, "degC")
        if unit_lower in {"c", "degc", "celsius"}:
            return (value, "degC")
        return (value, unit)

    @staticmethod
    def get_family(unit: str) -> Optional[str]:
        u = unit.strip().lower()
        if u in UnitNormalizer.FINANCIAL_TO_CR:
            return "financial"
        if u in UnitNormalizer.POWER_TO_KW:
            return "power"
        if u in UnitNormalizer.PRESSURE_TO_BAR:
            return "pressure"
        if u in UnitNormalizer.VOLUME_TO_L:
            return "volume"
        if u in UnitNormalizer.FLOW_TO_M3HR:
            return "flow"
        if u in UnitNormalizer.PERCENTAGE_UNITS:
            return "percentage"
        if u in UnitNormalizer.YEAR_UNITS:
            return "years"
        if u in {"f", "degf", "fahrenheit", "c", "degc", "celsius"}:
            return "temperature"
        return None

    @staticmethod
    def are_compatible(unit1: str, unit2: str) -> bool:
        f1 = UnitNormalizer.get_family(unit1)
        f2 = UnitNormalizer.get_family(unit2)
        return f1 is not None and f1 == f2

    @staticmethod
    def compare(value1: float, unit1: str, operator: str, value2: float, unit2: str) -> bool:
        """Compare two values with potentially different units after normalizing."""
        norm_val1, _ = UnitNormalizer.normalize(value1, unit1)
        norm_val2, _ = UnitNormalizer.normalize(value2, unit2)
        if operator == ">=":
            return norm_val1 >= norm_val2
        elif operator == ">":
            return norm_val1 > norm_val2
        elif operator == "<=":
            return norm_val1 <= norm_val2
        elif operator == "<":
            return norm_val1 < norm_val2
        elif operator == "==":
            return abs(norm_val1 - norm_val2) < 1e-9
        return False
