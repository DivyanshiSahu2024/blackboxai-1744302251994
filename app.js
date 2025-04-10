// Web3 Instance
let web3;
let userAccount;

// DOM Elements
const connectWalletBtn = document.getElementById('connectWallet');
const walletAddressElement = document.getElementById('walletAddress');
const ethBalanceElement = document.getElementById('ethBalance');
const networkNameElement = document.getElementById('networkName');
const connectionStatusElement = document.getElementById('connectionStatus');
const sendTransactionForm = document.getElementById('sendTransaction');

// Network Names
const networks = {
    1: 'Ethereum Mainnet',
    5: 'Goerli Testnet',
    11155111: 'Sepolia Testnet',
    1337: 'Local Network',
    31337: 'Hardhat Network'
};

// Initialize Web3
async function initWeb3() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            web3 = new Web3(window.ethereum);
            
            // Get connected account
            const accounts = await web3.eth.getAccounts();
            userAccount = accounts[0];
            
            // Update UI
            updateUI();
            
            // Setup event listeners
            setupEventListeners();
            
            return true;
        } catch (error) {
            console.error('User denied account access:', error);
            return false;
        }
    } else {
        console.log('Please install MetaMask!');
        alert('Please install MetaMask to use this dApp!');
        return false;
    }
}

// Update UI with account information
async function updateUI() {
    if (!web3 || !userAccount) return;

    try {
        // Update wallet address
        walletAddressElement.textContent = `${userAccount.substring(0, 6)}...${userAccount.substring(38)}`;
        
        // Update ETH balance
        const balance = await web3.eth.getBalance(userAccount);
        const ethBalance = web3.utils.fromWei(balance, 'ether');
        ethBalanceElement.textContent = `${parseFloat(ethBalance).toFixed(4)} ETH`;
        
        // Update network name
        const networkId = await web3.eth.net.getId();
        networkNameElement.textContent = networks[networkId] || `Network ID: ${networkId}`;
        
        // Update connection status
        connectionStatusElement.textContent = 'Connected';
        connectionStatusElement.classList.add('text-green-600');
        
        // Update connect button
        connectWalletBtn.innerHTML = '<i class="fas fa-wallet mr-2"></i>Connected';
        connectWalletBtn.classList.add('bg-green-600');
        connectWalletBtn.classList.remove('bg-blue-600');
    } catch (error) {
        console.error('Error updating UI:', error);
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Listen for account changes
    window.ethereum.on('accountsChanged', (accounts) => {
        userAccount = accounts[0];
        updateUI();
    });

    // Listen for network changes
    window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
    });

    // Connect wallet button
    connectWalletBtn.addEventListener('click', initWeb3);

    // Send transaction form
    if (sendTransactionForm) {
        sendTransactionForm.addEventListener('submit', handleSendTransaction);
    }
}

// Handle Send Transaction
async function handleSendTransaction(event) {
    event.preventDefault();

    if (!web3 || !userAccount) {
        alert('Please connect your wallet first!');
        return;
    }

    const recipientAddress = document.getElementById('recipientAddress').value;
    const amount = document.getElementById('amount').value;

    if (!web3.utils.isAddress(recipientAddress)) {
        alert('Please enter a valid Ethereum address!');
        return;
    }

    if (!amount || amount <= 0) {
        alert('Please enter a valid amount!');
        return;
    }

    try {
        const amountInWei = web3.utils.toWei(amount, 'ether');
        
        // Send transaction
        const transaction = await web3.eth.sendTransaction({
            from: userAccount,
            to: recipientAddress,
            value: amountInWei
        });

        alert(`Transaction sent! Hash: ${transaction.transactionHash}`);
        
        // Clear form
        document.getElementById('recipientAddress').value = '';
        document.getElementById('amount').value = '';
        
        // Update balance
        updateUI();
    } catch (error) {
        console.error('Error sending transaction:', error);
        alert('Error sending transaction. Please check the console for details.');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if MetaMask is installed
    if (typeof window.ethereum !== 'undefined') {
        // Setup initial event listeners
        connectWalletBtn.addEventListener('click', initWeb3);
        
        // If user is already connected to MetaMask
        if (window.ethereum.selectedAddress) {
            initWeb3();
        }
    } else {
        connectWalletBtn.innerHTML = '<i class="fas fa-exclamation-triangle mr-2"></i>Install MetaMask';
        connectWalletBtn.classList.add('bg-red-600');
        connectWalletBtn.classList.remove('bg-blue-600');
    }
});
