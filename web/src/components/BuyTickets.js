import React, { useState, useEffect } from 'react';
import logo from '../images/algorand_logo_mark_black.png';
import { PeraWalletConnect } from "@perawallet/connect";
import * as algokit from '@algorandfoundation/algokit-utils';
import appspec from '../artifacts/application.json';
import algosdk from 'algosdk';
import { connectedAddress } from './Connect';

export default function BuyTickets({ submissions }) {
  const [eventData, setEventData] = useState([]);
  const [message, setMessage] = useState(null);


  let NFTticketingdApp;
  const peraWallet = new PeraWalletConnect();
  const algod = algokit.getAlgoClient(algokit.getAlgoNodeConfig('testnet', 'algod'));

  useEffect(() => {
    const processedData = submissions.map((event) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(event.image);
      fileReader.onload = (e) => {
        const imageSrc = e.target.result;
        setEventData((prevData) => [
          ...prevData,
          { ...event, image: imageSrc },
        ]);
      };
      return fileReader;
    });

    return () => {
      processedData.forEach((fileReader) => {
        fileReader.abort();
      });
    };
  }, [submissions]);

  const signTxns = async (unsignedTxns) => {
    const signerTransactions = unsignedTxns.map((txn) => ({
      txn,
      signers: [algosdk.encodeAddress(txn.from.publicKey)],
    }));
    return peraWallet.signTransaction([signerTransactions]);
  };

  const handleBuyTicket = async (event) => {
    const sender = {
      addr: connectedAddress,
      signer: signTxns,
    };

    NFTticketingdApp = algokit.getAppClient(
      {
        app: JSON.stringify(appspec),
        sender,
        resolveBy: 'id',
        id: event.appID,
      },
      algod,
    );

    const minted_ticketsKeyType = algosdk.ABIType.from('(address,uint64)');
    const minted_ticketsKeyPrefix = new Uint8Array(Buffer.from('m-'));
    const minted_ticketsKey = new Uint8Array([
      ...minted_ticketsKeyPrefix,
      ...minted_ticketsKeyType.encode([algosdk.getApplicationAddress(event.appID), event.ticket_id]),
    ]);

    const optin = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      suggestedParams: await algod.getTransactionParams().do(),
      assetIndex: event.asset_ID,
      from: sender.addr,
      to: sender.addr,
      amount: 0,
    });

    const payment = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      suggestedParams: await algod.getTransactionParams().do(),
      amount: ((Number(event.ticketPrice)) * 1000000),
      from: sender.addr,
      to: event.organizer_address,
    });
    const args = [event.asset_ID, event.ticket_id, { txn: payment, signer: sender.signer }, { txn: optin, signer: sender.signer }];

    await NFTticketingdApp.call({
      method: 'buy',
      sendParams: { fee: algokit.microAlgos(algosdk.ALGORAND_MIN_TX_FEE * 3) },
      methodArgs: args,
      boxes: [{ appIndex: 0, name: minted_ticketsKey }],
      sender,
    });

    setMessage(`Congrats! You bought a NFT ticket. Check <a target='_blank' href='https://testnet.explorer.perawallet.app/accounts/${sender.addr}/'>here</a>`);

    setTimeout(() => {
      setMessage(null);
    }, 5000);

  };

  return (
    <div className="container">
      {message && (
        <div className="alert alert-success my-2" role="alert">
          <div dangerouslySetInnerHTML={{ __html: message }} />
        </div>
      )}
      <div className="row">
        {eventData.map((event, index) => (
          <div className="col-md-4" key={index} style={{ margin: '30px 0' }}>
            <div
              className="card"
              style={{ width: '18rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderRadius: '8px' }}
            >
              <img
                src={event.image}
                className="card-img-top"
                alt="Event"
                style={{ height: '200px', objectFit: 'cover', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}
              />
              <div className="card-body">
                <h5 className="card-title">{event.name}</h5>
                <p className="card-text">Date: {event.date}</p>
                <p className="card-text">
                  Time: {event.startTime} - {event.endTime}
                </p>
                <p className="card-text">
                  Address: {event.address}, {event.city}, {event.zip}
                </p>
                <p className="card-text">
                  Number of Tickets: {event.numberOfTickets}
                </p>
                <p className="card-text">
                  Price of a Ticket: {event.ticketPrice}
                  <img src={logo} alt="Currency Logo" style={{ width: '30px', marginLeft: '1px' }} />
                </p>
                <p className="card-text">
                  Event ID: {event.ticket_id}
                </p>
                <p className="card-text">
                  Asset ID: {event.asset_ID}
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => handleBuyTicket(event)}
                  style={{ width: '100%', marginTop: '20px' }}
                >
                  Buy Ticket
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
