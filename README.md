# NFT Ticketing DApp on Algorand: A Developer's Guide
Video demo: https://drive.google.com/file/d/1e3eBZ3iJr-e5V3CGQkDh7ookplrzjhKL/view?usp=sharing

## Frontend look
![Screenshot (5)](https://github.com/Akshat-cs/NFT-Ticketing-DApp/assets/75172495/38b3ac62-0b37-4bc1-8914-684a606ffe02)
![Screenshot (6)](https://github.com/Akshat-cs/NFT-Ticketing-DApp/assets/75172495/8fbaee7e-07bd-43b4-ba41-5cc1272c2aa4)
![Screenshot (7)](https://github.com/Akshat-cs/NFT-Ticketing-DApp/assets/75172495/41df2c71-6446-4046-af37-18bddb164a0e)

## Introduction

In the world of blockchain technology, Non-Fungible Tokens (NFTs) have gained significant attention for their unique properties and ability to represent ownership of digital assets. Algorand, a high-performance blockchain platform, offers developers a robust ecosystem to build decentralized applications (DApps) with NFT capabilities. In this guide, we'll explore an example application - an NFT ticketing DApp - that showcases the power and simplicity of developing on Algorand.

## Overview of the NFT Ticketing DApp

This article explains what the NFT ticketing DApp is and how it works. We also provide an example repository where you can clone and run it yourself. It's important to note that this example assumes prior knowledge of smart contracts on Algorand and requires experience in smart contract development. Additionally, while this example serves as a learning tool, it has not undergone a formal audit and contains intentional choices that make it unsuitable for production without modifications.

### Smart Contract Methods

1. `create()`: This method is used to create the NFT ticketing DApp. It initializes the global state of the application.

2. `mint(ticket, ticket_id, mbr_payment, *, output)`: The `mint` method allows users to mint NFT tickets for events. It takes parameters such as the ticket details (`ticket`), ticket ID (`ticket_id`), the MBR payment transaction (`mbr_payment`), and an output variable (`output`). This method ensures that the MBR payment is sent to the contract and checks if the ticket for this ticket id already exists. It then sets the ticket details in the `minted_tickets` mapping and mints the NFT.

3. `buy(asset, ticket_id, payment, optin_payment)`: The `buy` method enables users to purchase NFT tickets for events. It requires parameters such as the asset details (`asset`), ticket ID (`ticket_id`), payment transaction (`payment`), and opt-in payment transaction (`optin_payment`). This method verifies the payment transaction and ensures that the buyer doesn't already own a ticket. It then transfers the payment to the organizer and transfers the NFT ticket to the buyer.

Please note that the above explanations provide an overview of the methods in the smart contract and their functionalities. For detailed code implementation, please refer to the provided code repository.

## Key Components and Functionality

**LogEvent:** This component facilitates the creation and deployment of the NFT ticketing application on the Algorand blockchain. Developers can leverage the algokit library to interact with Algorand's blockchain, while the Web3.storage library handles the storage of event image and metadata associated with NFT tickets. By providing event details and invoking the minting process, users can create unique NFT tickets for their events.

**BuyTickets:** In this component, users can explore a list of available events and purchase NFT tickets. It integrates the algokit library for seamless interaction with the Algorand blockchain and utilizes the PeraWalletConnect library for wallet connectivity. By clicking the "Buy Ticket" button, users initiate the purchase process, involving a payment transaction to the Event Organizer's address.

**CheckIn:** Designed for event organizers, this component enables them to validate NFT tickets by scanning users' wallet QR codes. It employs the react-qr-scanner library to scan QR codes and the algokit library to interact with the Algorand blockchain. Upon scanning, the component verifies ticket ownership by asset ID with the deployed NFT ticketing application.

**Demo:** Using the repository NFTTicketingDApp, we’ll now step through the entire process of how the NFT ticketing DApp works. Please note that this demo won’t show off anything overly complicated, and will simply demonstrate the functionality of being able to create your own NFT tickets for your event and then any other user will be able to buy a ticket to your event with the Pera wallet. And you can also use the check-in functionality of the DApp to ensure at the event gates if a certain individual holds the NFT ticket to your event or not, just by scanning his/her Pera wallet QR code.

## Prerequisites for Running the DApp

Run these scripts on any terminal:

- Git
  - Check if already installed or not: `git --version`
  - To install on MacOS: Check out this video to install git - [YouTube](https://youtu.be/ZM3I16Z-lxI)
  - To install on windows: Check out this video to install git - [YouTube](https://youtu.be/JgOs70Y7jew)

- Python 3.10+
  - Check if already installed or not: `python --version`
  - To install on MacOS: Check out this video to install python - [YouTube](https://youtu.be/M323OL6K5vs)
  - To install on windows: Check out this video to install python - [YouTube](https://youtu.be/JJQW3GPnzQ8)
    
- Pipx
  - Check if already installed or not: `pipx --version`
  - To install: `python -m pip install pipx`

- Algokit
  - Check if already installed or not: `algokit --version`
  - To install: `pipx install algokit`

- Test ALGOS in your Pera account to successfully complete the transactions. Use [https://bank.testnet.algorand.network/](https://bank.testnet.algorand.network/) to get test ALGOS.

The following steps should get you up and running with an instance of the NFT Ticketing DApp:

1. Clone the repository: `git clone https://github.com/Akshat-cs/NFT-Ticketing-DApp`

2. Bootstrap the algokit: `algokit bootstrap all`

3. Replace the `Get the api token here https://web3.storage/` with the `api_token` on line 20 of `LogEvent.js` in the components directory.

4. Navigate to the `web` directory: `cd web`

5. Start the application: `npm start`

## Conclusion

By exploring the NFT ticketing DApp, developers gain insights into building decentralized applications on the Algorand blockchain. The example application demonstrates how to leverage the Algorand ecosystem, including the algokit library, smart contracts, and NFT capabilities, to create innovative and secure solutions. With this knowledge, developers can dive into the Algorand documentation, clone the NFT ticketing DApp repository, and begin their journey to develop their own blockchain applications on Algorand. Hopefully, this article and the demonstration of what the NFT Ticketing DApp is capable of have inspired you to take advantage of it, or build your own version. All the code is available for you to download, use, and modify. If you have any improvements, please feel free to submit a PR, or if you have any questions or just want to discuss other Algorand-related subjects, join the Algorand Discord.

