import async from 'async';
import sjcl from 'sjcl';
import BigInteger from 'big-integer';

// Polyfill globals for DigitalPersona WebSDK
if (typeof window !== 'undefined') {
  window.async = async;
  window.sjcl = sjcl;
  window.BigInteger = BigInteger;
  
  // Providing a stub for SRPClient in case it's not used in the local capture path
  if (!window.SRPClient) {
    window.SRPClient = function() {
      console.warn('SRPClient stub called - Secure channel authentication might fail');
    };
  }

  // DigitalPersona WebSDK Core also needs to be initialized or stubbed if missing
  if (!window.WebSdkCore) {
    window.WebSdkCore = {};
  }
}
