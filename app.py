from pathlib import Path
from beaker import *
from typing import Literal
from beaker.lib.storage import BoxMapping
from pyteal import *


class NFTticket(abi.NamedTuple):
    name: abi.Field[abi.String]
    total: abi.Field[abi.Uint64]
    asset_url: abi.Field[abi.String]
    asset_price: abi.Field[abi.Uint64]
    organizer_address: abi.Field[abi.String]


class Dapp:
    # Box Storage
    minted_tickets = BoxMapping(
        key_type=abi.Tuple2[abi.Address, abi.Uint64],
        value_type=NFTticket,
        prefix=Bytes("m-"),
    )
    has_ownership = BoxMapping(
        key_type=abi.Tuple2[abi.Address, abi.Uint64],
        value_type=abi.Bool,
        prefix=Bytes("h-"),
    )


app = Application("NFTticketingdApp", state=Dapp)


@app.create(bare=True)
def create() -> Expr:
    return app.initialize_global_state()


@app.external
def mint(
    ticket: NFTticket,
    ticket_id: abi.Uint64,
    mbr_payment: abi.PaymentTransaction,
    *,
    output: abi.Uint64,
) -> Expr:
    ticket_key = abi.make(abi.Tuple2[abi.Address, abi.Uint64])
    addr = abi.Address()
    name = abi.String()
    total = abi.Uint64()
    asset_url = abi.String()
    asset_price = abi.Uint64()
    organizer_address = abi.String()
    return Seq(
        # Assert MBR payment is going to the contract
        Assert(mbr_payment.get().receiver() == Global.current_application_address()),
        # Get current MBR before adding nfttickets
        pre_mbr := AccountParam.minBalance(Global.current_application_address()),
        # Set ticket key
        addr.set(Global.current_application_address()),
        ticket_key.set(addr, ticket_id),
        # Check if the ticket already exists
        Assert(app.state.minted_tickets[ticket_key].exists() == Int(0)),
        app.state.minted_tickets[ticket_key].set(ticket),
        # Get properties from ticket and mint NFT
        ticket.name.store_into(name),
        ticket.total.store_into(total),
        ticket.asset_url.store_into(asset_url),
        ticket.asset_price.store_into(asset_price),
        ticket.organizer_address.store_into(organizer_address),
        InnerTxnBuilder.Execute(
            {
                TxnField.type_enum: TxnType.AssetConfig,
                TxnField.config_asset_name: name.get(),
                TxnField.config_asset_unit_name: Bytes("TNFT"),
                TxnField.config_asset_reserve: Global.current_application_address(),
                TxnField.config_asset_url: asset_url.get(),
                TxnField.config_asset_total: total.get(),
                TxnField.fee: Int(0),
            }
        ),
        # Verify payment covers MBR difference
        current_mbr := AccountParam.minBalance(Global.current_application_address()),
        Assert(mbr_payment.get().amount() >= current_mbr.value() - pre_mbr.value()),
        output.set(InnerTxn.created_asset_id()),
    )


@app.external
def buy(
    asset: abi.Asset,
    ticket_id: abi.Uint64,
    payment: abi.PaymentTransaction,
    optin_payment: abi.AssetTransferTransaction,
) -> Expr:
    return_value = NFTticket()
    asset_price = abi.Uint64()
    organizer_address = abi.String()
    ticket_key = abi.make(abi.Tuple2[abi.Address, abi.Uint64])
    has_ownership_key = abi.make(abi.Tuple2[abi.Address, abi.Uint64])
    addr = abi.Address()
    addr1 = abi.Address()
    true_value = abi.Bool()
    return Seq(
        # Set ticket key
        addr1.set(Global.current_application_address()),
        ticket_key.set(addr1, ticket_id),
        # Set has_ownership key
        addr.set(Txn.sender()),
        has_ownership_key.set(addr, ticket_id),
        # Check that the buyer should not own any ticket yet
        Assert(app.state.has_ownership[has_ownership_key].exists() == Int(0)),
        # Store the value boxmapping[index]
        app.state.minted_tickets[ticket_key].store_into(return_value),
        return_value.asset_price.store_into(asset_price),
        return_value.organizer_address.store_into(organizer_address),
        # Verify payment transaction
        Assert(payment.get().amount() == asset_price.get()),
        Assert(payment.get().receiver() == organizer_address.get()),
        InnerTxnBuilder.Execute(
            {
                TxnField.type_enum: TxnType.AssetTransfer,
                TxnField.fee: Int(0),  # cover fee with outer txn
                TxnField.asset_receiver: Txn.sender(),
                TxnField.xfer_asset: asset.asset_id(),
                TxnField.asset_amount: Int(1),
            }
        ),
        # Set has_ownership to true
        true_value.set(value=True),
        app.state.has_ownership[has_ownership_key].set(true_value),
    )


if __name__ == "__main__":
    app.build().export(Path(__file__).resolve().parent / "./artifacts")
