import React, { useState, useEffect } from 'react';
import algosdk from 'algosdk'
import { Web3Storage } from 'web3.storage/dist/bundle.esm.min.js';
import { connectedAddress } from './Connect';
import { PeraWalletConnect } from "@perawallet/connect";
import * as algokit from '@algorandfoundation/algokit-utils';
import appspec from '../artifacts/application.json';


export let dAppId;

export default function LogEvent({ onFormSubmit }) {

  const [NFTticketingdApp, setNFTticketingdApp] = useState(null);
  const [NFTticketingdAppId, setNFTticketingdAppId] = useState(null);
  const [message, setMessage] = useState('No nft tickets minted!');
  const [isCreatingApp, setIsCreatingApp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const W3S_TOKEN = 'Get the api token here https://web3.storage/';
  const w3s = new Web3Storage({ token: W3S_TOKEN });

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    startTime: '',
    endTime: '',
    address: '',
    city: '',
    zip: '',
    numberOfTickets: 0,
    ticketPrice: 0,
    image: null,
    submitted: false,
    asset_ID: 0,
    appID: 0,
    ticket_id: 0,
  });

  const BOX_CREATE_COST = 0.0025e6;
  const BOX_BYTE_COST = 0.0004e6;
  const peraWallet = new PeraWalletConnect();
  const algod = algokit.getAlgoClient(algokit.getAlgoNodeConfig('testnet', 'algod'));
  const indexerClient = algokit.getAlgoIndexerClient(algokit.getAlgoNodeConfig('testnet', 'indexer'));

  async function imageToArc3(file) {
    const imageFile = new File([await file.arrayBuffer()], file.name, { type: file.type });
    const imageRoot = await w3s.put([imageFile], { name: file.name });
    console.log('Image root', imageRoot);

    const metadata = JSON.stringify({
      decimals: 0,
      name: formData.name,
      unitName: "TICKET",
      image: `ipfs://${imageRoot}/${file.name}`,
      image_mimetype: file.type,
      properties: {},
    });

    const metadataFile = new File([metadata], 'metadata.json', { type: 'text/plain' });
    const metadataRoot = await w3s.put([metadataFile], { name: 'metadata.json' });
    console.log('Metadata root', metadataRoot);

    return metadataRoot;
  }

  const signTxns = async (unsignedTxns) => {
    const signerTransactions = unsignedTxns.map((txn) => ({
      txn,
      signers: [algosdk.encodeAddress(txn.from.publicKey)],
    }));
    return peraWallet.signTransaction([signerTransactions]);
  }

  const handleInputChange = (event) => {
    const { id, value } = event.target;
    setFormData((prevFormData) => ({ ...prevFormData, [id]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFormData((prevFormData) => ({ ...prevFormData, image: file }));
  };

  const handleCreate = async () => {
    console.log('connectedAddress:', connectedAddress);
    const sender = {
      addr: connectedAddress,
      signer: signTxns,
    };

    const appClientConfig = {
      app: JSON.stringify(appspec),
      sender,
      resolveBy: "creatorAndName",
      creatorAddress: sender.addr,
      findExistingUsing: indexerClient,
    };

    setIsCreatingApp(true);

    try {
      const appClient = algokit.getAppClient(appClientConfig, algod);
      console.log('appClient:', appClient);

      const { appId } = await appClient.create();
      console.log('App ID:', appId);
      dAppId = appId;

      setNFTticketingdApp(appClient);
      setNFTticketingdAppId(appId); // Set the NFTticketingdAppId state variable
    } catch (error) {
      console.log("Couldn't create the app: ", error);
    } finally {
      setIsCreatingApp(false);
    }
  };

  useEffect(() => {
    console.log('nftticketingdapp: ', NFTticketingdApp);
    console.log('NFTticketingdAppId:', NFTticketingdAppId);
  }, [NFTticketingdApp, NFTticketingdAppId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);

    try {

      const sender = {
        addr: connectedAddress,
        signer: signTxns,
      };

      const metadataRoot = await imageToArc3(formData.image);

      const ticketObject = {
        name: formData.name,
        total: Number(formData.numberOfTickets),
        assetURL: `ipfs://${metadataRoot}/metadata.json#arc3`,
      };

      console.log(NFTticketingdApp);

      const minted_ticketsId = (await NFTticketingdApp.getBoxNames()).filter((b) => {
        // filter out non minted_tickets boxes
        if (!b.name.startsWith('m-')) return false;
        // filter out minted_tickets that aren't from the sender
        return algosdk.encodeAddress(b.nameRaw.slice(2, 34)) === algosdk.getApplicationAddress(NFTticketingdAppId);
      }).length;

      const minted_ticketsKeyType = algosdk.ABIType.from('(address,uint64)');
      const minted_ticketsKeyPrefix = new Uint8Array(Buffer.from('m-'));
      const minted_ticketsKey = new Uint8Array([
        ...minted_ticketsKeyPrefix,
        ...minted_ticketsKeyType.encode([algosdk.getApplicationAddress(NFTticketingdAppId), minted_ticketsId]),
      ]);

      const boxMbr = BOX_CREATE_COST + (Object.values(ticketObject).reduce((totalLength, value) => totalLength + String(value).length, 0) + minted_ticketsKey.byteLength) * BOX_BYTE_COST;

      const payment = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        suggestedParams: await algod.getTransactionParams().do(),
        amount: 200_000 + boxMbr + 200_000,
        from: sender.addr,
        to: algosdk.getApplicationAddress(NFTticketingdAppId),
      });

      const args = [Object.values(ticketObject), minted_ticketsId, { txn: payment, signer: sender.signer }];
      const result = await NFTticketingdApp.call({
        method: 'mint',
        sendParams: { fee: algokit.microAlgos(algosdk.ALGORAND_MIN_TX_FEE * 5) },
        methodArgs: args,
        boxes: [{ appIndex: 0, name: minted_ticketsKey }],
        sender,
      });
      console.log('result: ', result);
      console.log('result.return: ', result.return);
      const assetid = result.return.returnValue;
      const trimmedAssetid = parseInt(assetid.toString().replace(/n$/, ''), 10);
      setMessage(`NFT tickets minted! See the tickets <a target='_blank' href='https://app.dappflow.org/explorer/nft/${trimmedAssetid}/transactions'>here</a>`);
      console.log("assetID: ", trimmedAssetid);

      // Add the additional data to the form data
      const updatedFormData = {
        ...formData,
        asset_ID: trimmedAssetid,
        appID: NFTticketingdAppId,
        ticket_id: minted_ticketsId,
        organizer_address: sender.addr,
      };

      onFormSubmit(updatedFormData);
      setFormData({
        name: '',
        date: '',
        startTime: '',
        endTime: '',
        address: '',
        city: '',
        zip: '',
        numberOfTickets: 0,
        ticketPrice: 0,
        image: null,
        submitted: true,
        asset_ID: 0,
        appID: 0,
        ticket_id: 0,
        asset_creator_address: '',
      });
    } catch (error) {
      console.log("Couldn't sign or send payment txns: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    let timer;
    if (formData.submitted) {
      timer = setTimeout(() => {
        setFormData((prevFormData) => ({ ...prevFormData, submitted: false }));
      }, 6000);
    }
    return () => clearTimeout(timer);
  }, [formData.submitted]);

  return (
    <div className="container">
      {formData.submitted && (
        <div
          className="alert alert-success mt-4"
          style={{
            position: 'fixed',
            top: '70px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: '9999',
          }}
        >
          <h4>Thank You!</h4>
          <p id="status" dangerouslySetInnerHTML={{ __html: message }}></p>
        </div>
      )}
      <form
        className="row g-3"
        style={{ marginTop: '50px' }}
        onSubmit={handleSubmit}
      >
        <div className="col-md-6">
          <label htmlFor="name" className="form-label">
            Name of the Event
          </label>
          <input
            type="text"
            className="form-control"
            id="name"
            value={formData.name}
            onChange={handleInputChange}
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="date" className="form-label">
            Date
          </label>
          <input
            type="date"
            className="form-control"
            id="date"
            value={formData.date}
            onChange={handleInputChange}
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="starttime" className="form-label">
            Start Time
          </label>
          <input
            type="time"
            className="form-control"
            id="startTime"
            value={formData.startTime}
            onChange={handleInputChange}
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="endtime" className="form-label">
            End Time
          </label>
          <input
            type="time"
            className="form-control"
            id="endTime"
            value={formData.endTime}
            onChange={handleInputChange}
          />
        </div>
        <div className="col-md-12">
          <label htmlFor="inputAddress" className="form-label">
            Address of the Event
          </label>
          <input
            type="text"
            className="form-control"
            id="address"
            placeholder="1234 Main St"
            value={formData.address}
            onChange={handleInputChange}
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="inputCity" className="form-label">
            City
          </label>
          <input
            type="text"
            className="form-control"
            id="city"
            value={formData.city}
            onChange={handleInputChange}
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="inputZip" className="form-label">
            Zip
          </label>
          <input
            type="text"
            className="form-control"
            id="zip"
            value={formData.zip}
            onChange={handleInputChange}
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="number" className="form-label">
            Number of Tickets
          </label>
          <input
            type="number"
            className="form-control"
            id="numberOfTickets"
            value={formData.numberOfTickets}
            onChange={handleInputChange}
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="price" className="form-label">
            Ticket Price (in ALGOS)
          </label>
          <input
            type="number"
            className="form-control"
            id="ticketPrice"
            value={formData.ticketPrice}
            onChange={handleInputChange}
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="image" className="form-label">
            Event Image
          </label>
          <input
            type="file"
            className="form-control"
            id="image"
            onChange={handleFileChange}
          />
        </div>
        <div className="col-6">
          <button type="submit" className="btn btn-primary my-4" disabled={isSubmitting || isCreatingApp || !NFTticketingdAppId}>
            {isSubmitting ? 'Creating NFT tickets...' : 'Create NFT tickets'}
          </button>
        </div>
      </form>
      <div className="col-6">
        <button type="create" className="btn btn-primary my-3" onClick={handleCreate} disabled={isCreatingApp || NFTticketingdAppId}>
          {isCreatingApp ? 'Creating app...' : 'Deploy app'}
        </button>
      </div>
    </div>
  );
}
