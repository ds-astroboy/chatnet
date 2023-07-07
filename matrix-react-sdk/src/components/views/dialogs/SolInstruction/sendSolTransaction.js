import { PublicKey } from "@solana/web3.js";
import { checkTransactionOnSolscan } from "../../../../apis"
import { sleep } from '@project-serum/common';
export function getUnixTs() {
    return new Date().getTime() / 1000
}

export const sendSolTransaction = async (
    transaction,
    owner,
    wallet,
    connection,
    signersExceptWallet = [],
    setIsShowConfirmation,
    mxEvent,
) => {
    const ownerPub = new PublicKey(owner);
    let signature;
    let result = false;
    let error = null;

    const timeout = 31000;
    const startTime = getUnixTs()
    try {
        console.log("Getting recent blockhash");
        transaction.recentBlockhash = (await connection.getRecentBlockhash("max")).blockhash;
        transaction.setSigners(
            ...([ownerPub]), //change user
            ...signersExceptWallet.map(s => s.publicKey)
        );
        signersExceptWallet.forEach(acc => {
            transaction.partialSign(acc);
        });
        console.log("Sending signature request to wallet");
        const signed = await wallet.signTransaction(transaction);
        console.log("Got signature, submitting transaction");
        signature = await connection.sendRawTransaction(
            signed.serialize(),
            {
                skipPreflight: true,
            }
        );
        
        console.log('Started awaiting confirmation for', signature)
        if(setIsShowConfirmation) {
          setIsShowConfirmation(true, signature, mxEvent);
        }

        let done = false
        ;(async () => {
        while (!done && getUnixTs() - startTime < timeout) {
            connection.sendRawTransaction(signed.serialize(), {
            skipPreflight: true,
            })
    
            await sleep(3000)
        }
        })()
        
        try {
            console.log('calling confirmation sig', signature, timeout, connection)
            const confirmResult = await awaitTransactionSignatureConfirmation(signature, timeout, connection);
            console.log(
              'calling signatures confirmation',
              confirmResult
            )
            if(confirmResult) {
              error = confirmResult.err;
              if(!confirmResult.err) {
                result = true;
              }
            }
        } 
        catch (err) {
            if (err.timeout) {
                throw new Error('Timed out awaiting confirmation on transaction')
            }
        
            let simulateResult = null
        
            console.log('sined transaction', signed)
        
            try {
                console.log('start simulate')
                simulateResult = (
                await simulateTransaction(connection, signed, 'single')
                ).value
            } catch (error) {
                console.log('Error simulating: ', error)
            }
        
            console.log('simulate result', simulateResult)
        
            if (simulateResult && simulateResult.err) {
                if (simulateResult.logs) {
                  console.log('simulate resultlogs', simulateResult.logs)
          
                  for (let i = simulateResult.logs.length - 1; i >= 0; --i) {
                      const line = simulateResult.logs[i]
          
                      if (line.startsWith('Program log: ')) {
                        error = 'Transaction failed: ' + line.slice('Program log: '.length);
                        throw new Error(
                          'Transaction failed: ' + line.slice('Program log: '.length)
                          )
                      }
                  }
                }
                error = JSON.stringify(simulateResult.err);
                throw new Error(JSON.stringify(simulateResult.err))
            }
            console.log('transaction error lasdkasdn')        
            throw new Error('Transaction failed');
        } 
        finally {
            done = true
        }
        
    }
    catch (e) {
        console.warn(e);
        error = e;
        if (signature) {
            result = await checkTransactionOnSolscan(signature);
            if(result) error = null;
      }
    }
    if (setIsShowConfirmation) {
        setIsShowConfirmation(false);
    }
    return { result, error };
}

async function awaitTransactionSignatureConfirmation(
  signature,
  timeout,
  connection
) {
  let done = false
  const result = await new Promise((resolve, reject) => {
    // eslint-disable-next-line
    ;(async () => {
      setTimeout(() => {
        if (done) {
          return
        }
        done = true
        console.log('Timed out for signature', signature)
        reject({ timeout: true })
      }, timeout)
      try {
        connection.onSignature(
          signature,
          (result) => {
            console.log('WS confirmed', signature, result, result.err)
            done = true
            if (result.err) {
              reject(result.err)
            } else {
              resolve(result)
            }
          },
          connection.commitment
        )
        console.log('Set up WS connection', signature)
      } catch (e) {
        done = true
        console.log('WS error in setup', signature, e)
      }
      while (!done) {
        // eslint-disable-next-line
        ;(async () => {
          try {
            const signatureStatuses = await connection.getSignatureStatuses([
              signature,
            ])

            console.log('signatures cancel proposal', signatureStatuses)

            const result = signatureStatuses && signatureStatuses.value[0]

            console.log('result signatures proosa', result, signatureStatuses)

            if (!done) {
              if (!result) {
                // console.log('REST null result for', signature, result);
              } else if (result.err) {
                console.log('REST error for', signature, result)
                done = true
                reject(result.err)
              }
              // @ts-ignore
              else if (
                !(
                  result.confirmations ||
                  result.confirmationStatus === 'confirmed' ||
                  result.confirmationStatus === 'finalized'
                )
              ) {
                console.log('REST not confirmed', signature, result)
              } else {
                console.log('REST confirmed', signature, result)
                done = true
                resolve(result)
              }
            }
          } catch (e) {
            if (!done) {
              console.log('REST connection error: signature', signature, e)
            }
          }
        })()
        await sleep(3000)
      }
    })()
  })
  done = true
  return result
}

export async function simulateTransaction(
    connection,
    transaction,
    commitment
  ) {
    // @ts-ignore
    transaction.recentBlockhash = await connection._recentBlockhash(
      // @ts-ignore
      connection._disableBlockhashCaching
    )
  
    console.log('simulating transaction', transaction)
  
    const signData = transaction.serializeMessage()
    // @ts-ignore
    const wireTransaction = transaction._serialize(signData)
    const encodedTransaction = wireTransaction.toString('base64')
  
    console.log('encoding')
    const config = { encoding: 'base64', commitment }
    const args = [encodedTransaction, config]
    console.log('simulating data', args)
  
    // @ts-ignore
    const res = await connection._rpcRequest('simulateTransaction', args)
  
    console.log('res simulating transaction', res)
    if (res.error) {
      throw new Error('failed to simulate transaction: ' + res.error.message)
    }
    return res.result
  }