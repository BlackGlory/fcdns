declare module 'native-node-dns-packet' {
  export const NAME_TO_RCODE = {
    NOERROR: 0
  , FORMERR: 1
  , SERVFAIL: 2
  , NOTFOUND: 3
  , NOTIMP: 4
  , REFUSED: 5
  , YXDOMAIN: 6
  , YXRRSET: 7
  , NXRRSET: 8
  , NOTAUTH: 9
  , NOTZONE: 10
  , BADVERS: 16
  , BADSIG: 16
  , BADKEY: 17
  , BADTIME: 18
  , BADMODE: 19
  , BADNAME: 20
  , BADALG: 21
  , BADTRUNC: 22
  }
}
