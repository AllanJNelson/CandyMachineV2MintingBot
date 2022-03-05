import * as anchor from '@project-serum/anchor';

const CIVIC = new anchor.web3.PublicKey(
    '',
);

const getNetworkExpire = async (gatekeeperNetwork) => {
    return await anchor.web3.PublicKey.findProgramAddress(
      [gatekeeperNetwork.toBuffer(), Buffer.from('expire')],
      CIVIC,
    );
};

export {
    CIVIC,
    getNetworkExpire
}
