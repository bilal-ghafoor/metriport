# This file was auto-generated by Fern from our API Definition.

import datetime as dt
import typing

import pydantic

from ....core.datetime_utils import serialize_datetime
from .us_state import UsState


class Address(pydantic.BaseModel):
    address_line_1: str = pydantic.Field(alias="addressLine1", description="The address.")
    address_line_2: typing.Optional[str] = pydantic.Field(
        alias="addressLine2", description="The address details, for example `#4451`"
    )
    city: str = pydantic.Field(description="The city.")
    state: UsState = pydantic.Field(description="The 2 letter state acronym, for example `CA`")
    zip: str = pydantic.Field(description="Zip must be a string consisting of 5 numbers.")
    country: str = pydantic.Field(description="Defaults to “USA”")

    def json(self, **kwargs: typing.Any) -> str:
        kwargs_with_defaults: typing.Any = {"by_alias": True, "exclude_unset": True, **kwargs}
        return super().json(**kwargs_with_defaults)

    def dict(self, **kwargs: typing.Any) -> typing.Dict[str, typing.Any]:
        kwargs_with_defaults: typing.Any = {"by_alias": True, "exclude_unset": True, **kwargs}
        return super().dict(**kwargs_with_defaults)

    class Config:
        frozen = True
        smart_union = True
        allow_population_by_field_name = True
        json_encoders = {dt.datetime: serialize_datetime}