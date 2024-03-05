'use client';
import { useEffect, useState } from 'react';
import SnetSDK from 'snet-sdk-web';
import { example } from './assets/service';
import { config } from "./config";
import Web3 from 'web3';

export default function ExampleService() {
    const [logs, setLogs] = useState([]);
    const [firstNumber, setFirstNumber] = useState(10);
    const [secondNumber, setSecondNumber] = useState(20);
    const [account, setAccount] = useState("");

    const logToScreen = (...args) => {
        let method = 'log';
        let message = '';

        args.forEach(arg => {
            if (typeof arg === 'string') {
                message += arg + ' ';
            } else if (typeof arg === 'object') {
                try {
                    message += JSON.stringify(arg) + ' ';
                } catch { }
            } else if (['log', 'error', 'warn', 'info', 'debug'].includes(arg)) {
                method = arg;
            }
        });

        setLogs(prevLogs => [...prevLogs, { method, message }]);
    };

    const connectMetamask = async () => {
        if (window.ethereum) {
            try {
                // Request account access if needed
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const web3Instance = new Web3(window.ethereum);

                // Fetch chainId
                const chainId = await window.ethereum.request({ method: 'eth_chainId' });

                // Check if chainId is the desired one (in this case, chainId 5)
                console.log('chainId',chainId);
                if (chainId !== '0x5') {
                    console.error('Please connect to the goerli network');
                }

                const accs = await web3Instance.eth.getAccounts();
                setAccount(accs[0]);
            } catch (error) {
                console.error('Error connecting to MetaMask:', error);
            }
        } else {
            console.warn('MetaMask not detected');
        }
    };


    const runService = async () => {
        setLogs([]);
        const sdk = new SnetSDK(config);

        const client = await sdk.createServiceClient(
            "masp",
            "masp_s1"
        );

        const request = new example.Calculator.add.requestType();
        request.setA(firstNumber);
        request.setB(secondNumber);

        const invokeOptions = {
            request: request,
            debug: true,
            transport: undefined,
            onEnd: (response) => {
                if (response.status === 0) {
                    const value = response.message.getValue();
                    console.log('--- Service Response --', value.toString());
                    return;
                }
                console.error('error occured', response.status, response.message)
            },
        }

        await client.unary(example.Calculator.add, invokeOptions);
    }

    useEffect(() => {
        // Override console logging methods with custom logging wrapper
        ['log', 'error', 'warn', 'info', 'debug'].forEach(method => {
            const originalConsoleMethod = console[method];
            console[method] = (...args) => {
                // Log to console window
                originalConsoleMethod.apply(console, args);
                // Add log message with the method name to the UI logs state
                logToScreen(...args)
            };
        });

        // Clean-up function to restore original console methods when the component unmounts
        return () => {
            ['log', 'error', 'warn', 'info', 'debug'].forEach(method => {
                console[method] = console[method].__proto__;
            });
        };
    }, []);


    return <div>
        <p>Orgnization name: masp</p>
        <p>Service name: masp_s1</p>
        <input type="text" placeholder="Enter first number" value={firstNumber} onChange={(e) => {
            setFirstNumber(e.target.value);
        }} />
        <br />
        <input type="text" placeholder="Enter second number" value={secondNumber} onChange={(e) => {
            setSecondNumber(e.target.value);
        }} />
        <br />
        <br />

        {logs.map((log, index) => (
            <p key={index} style={{ color: log.method === 'error' ? 'red' : 'black' }}>
                <strong>{log.method.toUpperCase()}:</strong> {log.message}
            </p>
        ))}
        <button onClick={() => {
            if (account) return;
            connectMetamask()
        }}>{account ? 'Metamask Connected' : 'Connect Metamask'}</button> <br />
        <button onClick={() => { runService() }}> Add Number </button>
    </div>
}