import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
var BufferLayout = require('buffer-layout');

export const AccountState  = {
    Uninitialized: 0,
    Initialized: 1,
    Frozen: 2,
}

/**
 * Layout for a public key
 */

const publicKey = (property = 'publicKey') => {
return BufferLayout__namespace.blob(32, property);
};
/**
 * Layout for a 64bit unsigned value
 */

const uint64 = (property = 'uint64') => {
return BufferLayout__namespace.blob(8, property);
};

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () {
            return e[k];
          }
        });
      }
    });
  }
  n['default'] = e;
  return Object.freeze(n);
}

var BufferLayout__namespace = /*#__PURE__*/_interopNamespace(BufferLayout);
const AccountLayout = BufferLayout__namespace.struct([publicKey('mint'), publicKey('owner'), uint64('amount'), BufferLayout__namespace.u32('delegateOption'), publicKey('delegate'), BufferLayout__namespace.u8('state'), BufferLayout__namespace.u32('isNativeOption'), uint64('isNative'), uint64('delegatedAmount'), BufferLayout__namespace.u32('closeAuthorityOption'), publicKey('closeAuthority')]);


export const getAccountInfo = async (
    connection, 
    address, 
    programId = TOKEN_PROGRAM_ID
) => {
    const info = await connection.getAccountInfo(address);
    console.log("info: ", info);
    if (!info) throw new Error('TokenAccountNotFoundError');
    console.log("info: ", info.owner.toBase58());
    if (!info.owner.equals(programId)) throw new Error('TokenInvalidAccountOwnerError');
    console.log("info.data.length: ", info.data.length);
    console.log("AccountLayout.span: ", AccountLayout.span);
    if (info.data.length != AccountLayout.span) throw new Error('TokenInvalidAccountSizeError');
    const rawAccount = AccountLayout.decode(Buffer.from(info.data));
    console.log("rawAccount ", rawAccount);

    return {
        address,
        mint: rawAccount.mint,
        owner: rawAccount.owner,
        amount: rawAccount.amount,
        delegate: rawAccount.delegateOption ? rawAccount.delegate : null,
        delegatedAmount: rawAccount.delegatedAmount,
        isInitialized: rawAccount.state !== AccountState.Uninitialized,
        isFrozen: rawAccount.state === AccountState.Frozen,
        isNative: !!rawAccount.isNativeOption,
        rentExemptReserve: rawAccount.isNativeOption ? rawAccount.isNative : null,
        closeAuthority: rawAccount.closeAuthorityOption ? rawAccount.closeAuthority : null,
    }
}