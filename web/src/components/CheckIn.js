import React, { useState, useEffect } from 'react';
import QrScanner from 'react-qr-scanner';
import * as algokit from '@algorandfoundation/algokit-utils';
import appspec from '../artifacts/application.json';
import algosdk from 'algosdk';
import { connectedAddress } from './Connect';

import { dAppId } from './LogEvent';

export default function CheckIn() {
  const [data, setData] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [eventID, setEventID] = useState(0);
  const [message, setMessage] = useState('');

  let NFTticketingdApp;
  const algod = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '');

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(''); // Clear the message after 5 seconds
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleScan = async (result) => {
    if (result) {
      setData(result.text);
      setShowScanner(false); // Close the scanner after scanning

      // Custom logic using scanned data and form inputs (organizerAddress and eventID)
      console.log('Scanned Data:', result.text);
      console.log('Event ID:', eventID);
      console.log('NFTticketingdAppId:', dAppId);

      // Custom logic for form submission (if needed)

      const sender = {
        addr: connectedAddress
      };

      NFTticketingdApp = algokit.getAppClient(
        {
          app: JSON.stringify(appspec),
          sender,
          resolveBy: 'id',
          id: dAppId,
        },
        algod,
      );
      console.log('NFTticketingdApp.getBoxNames(): ', NFTticketingdApp.getBoxNames());

      const hasOwnership = async () => {
        const boxNames = await NFTticketingdApp.getBoxNames();
        const ownershipBox = boxNames.find((b) => {
          // filter out non has_ownership boxes
          console.log('b.names: ', b.names);
          console.log('b.name.startsWithh-: ', b.name.startsWith('h-'));
          if (!b.name.startsWith('h-')) return false;

          console.log('algosdk.encodeAddress(b.nameRaw.slice(2, 34)): ', algosdk.encodeAddress(b.nameRaw.slice(2, 34)));
          console.log('result.text: ', result.text);
          if (algosdk.encodeAddress(b.nameRaw.slice(2, 34)) !== result.text) return false;

          console.log('1st value: ', algosdk.decodeUint64(b.nameRaw.slice(34, 42), 'safe'));
          console.log('2nd value: ', eventID);
          console.log('return value= ', algosdk.decodeUint64(b.nameRaw.slice(34, 42), 'safe') === eventID);
          return algosdk.decodeUint64(b.nameRaw.slice(34, 42), 'safe') === eventID;
        });

        return !!ownershipBox; // Return true if ownershipBox exists, false otherwise
      };

      if (await hasOwnership()) {
        setMessage('Successfully checked in!'); // User holds a ticket
      } else {
        setMessage('Do not hold a ticket!'); // User does not hold a ticket
      }
    }
  };

  const handleError = (error) => {
    console.error(error);
  };

  const handleScanQR = () => {
    setShowScanner(true); // Show the scanner when "Scan QR" button is clicked
    setData(''); // Clear the previous scan result
    setMessage(''); // Clear any previous messages
  };

  const handleCancelScan = () => {
    setShowScanner(false); // Close the scanner when "Cancel Scan" button is clicked
    setMessage(''); // Clear any previous messages
  };

  return (
    <>
      {message && (
        <div className="alert alert-info mt-4 " role="alert">
          {message}
        </div>
      )}
      <div className='container rounded p-4' style={{ backgroundColor: '#F8F9FA', color: '#212529', maxWidth: '500px', height: '440px', position: 'relative', marginTop: '80px' }}>
        <h2 className="mb-4">Check In</h2>
        <p style={{ marginBottom: '50px' }}>Scan wallet address to verify ticket ownership and check-in.</p>
        {showScanner ? (
          <div className="position-relative" style={{ width: '100%', height: '240px', marginTop: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <div style={{ marginLeft: '80px', marginTop: '100px' }}>
              <QrScanner
                onScan={handleScan}
                onError={handleError}
                style={{ width: 'calc(80% - 10px)', height: '80%', marginLeft: '0px', marginTop: '30px' }}
              />
            </div>
            <button type="button" className="btn btn-danger" onClick={handleCancelScan}>Cancel Scan</button>
          </div>
        ) : (
          <form>
            <div className="form-group">
              <label htmlFor="eventID">Event ID</label>
              <input type="text" className="form-control" id="eventID" value={eventID} onChange={(e) => setEventID(e.target.value)} required />
            </div>
            <div className="text-center">
              <button type="button" className="btn btn-success my-1" onClick={handleScanQR}>Scan QR</button>
            </div>
          </form>
        )}
        {data && (
          <p className="mt-4 " style={{ wordWrap: 'break-word', margin: '0px 0px' }}>
            Address: {data}
          </p>
        )}
      </div>
    </>
  );
}
