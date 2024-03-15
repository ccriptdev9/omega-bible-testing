# Omega Bible Decentralization Project

This repository contains the backend code for decentralizing Bible data using the Omega network. The project utilizes Node.js and Express.js.

## Setup Instructions

### Installation

Before running the project, make sure you have Node.js and npm installed on your system. Then, install the project dependencies by running the following command in the project root directory:

```bash
npm install
```

### Seed Peer Initialization

To initialize the seed peer, follow these steps:
1. Navigate to the `seed-peer` directory.
2. Run the following command:

```bash
node index.js
```

### Reader Peers Initialization

For the first reader peer, follow these steps:
1. Navigate to the `reader-peer` directory.
2. Run the following command:

```bash
node index.js
```

For the second reader peer, follow these steps:
1. Navigate to the `reader-peer` directory.
2. Run the following command:

```bash
node index.js peer-2-storage 3002 peer-2-drive
```


## Connection Messages

Once the peers have established connection with each other, the following messages will be displayed in the terminal:

### Seed Peer
Seed Peer - got a connection!

drives connected...


### Reader Peers
Reader - got a connection!

drives connected...


## Project Structure

- `seed-peer`: Contains code for the seed peer.
- `reader-peer`: Contains code for the reader peers.
- `index.js`: Main entry point for the backend server.

## Quick Links

- [Seed Peer Postman Collection](https://gold-satellite-400978.postman.co/workspace/New-Team-Workspace~26d9edb1-df61-4e13-b901-6d43be2f01d6/collection/31357640-b147df08-eccd-4488-bed0-71608123e3bb?action=share&creator=31357640)
- [Reader Peer Postman Collection](https://gold-satellite-400978.postman.co/workspace/New-Team-Workspace~26d9edb1-df61-4e13-b901-6d43be2f01d6/collection/31357640-591d25d8-8349-4f7e-80e7-e2344cfb20f0?action=share&creator=31357640)
- [Second Reader Peer Postman Collection](https://gold-satellite-400978.postman.co/workspace/New-Team-Workspace~26d9edb1-df61-4e13-b901-6d43be2f01d6/collection/31357640-ff0d2bce-c6b8-440a-89aa-fb244780df25?action=share&creator=31357640)

