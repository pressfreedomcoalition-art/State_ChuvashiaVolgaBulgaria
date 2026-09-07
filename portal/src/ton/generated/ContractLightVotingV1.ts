// @ts-nocheck
import {
    Cell,
    Slice,
    Address,
    Builder,
    beginCell,
    ComputeError,
    TupleItem,
    TupleReader,
    Dictionary,
    contractAddress,
    address,
    ContractProvider,
    Sender,
    Contract,
    ContractABI,
    ABIType,
    ABIGetter,
    ABIReceiver,
    TupleBuilder,
    DictionaryValue
} from '@ton/core';

export type DataSize = {
    $$type: 'DataSize';
    cells: bigint;
    bits: bigint;
    refs: bigint;
}

export function storeDataSize(src: DataSize) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.cells, 257);
        b_0.storeInt(src.bits, 257);
        b_0.storeInt(src.refs, 257);
    };
}

export function loadDataSize(slice: Slice) {
    const sc_0 = slice;
    const _cells = sc_0.loadIntBig(257);
    const _bits = sc_0.loadIntBig(257);
    const _refs = sc_0.loadIntBig(257);
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadGetterTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function storeTupleDataSize(source: DataSize) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.cells);
    builder.writeNumber(source.bits);
    builder.writeNumber(source.refs);
    return builder.build();
}

export function dictValueParserDataSize(): DictionaryValue<DataSize> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDataSize(src)).endCell());
        },
        parse: (src) => {
            return loadDataSize(src.loadRef().beginParse());
        }
    }
}

export type SignedBundle = {
    $$type: 'SignedBundle';
    signature: Buffer;
    signedData: Slice;
}

export function storeSignedBundle(src: SignedBundle) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBuffer(src.signature);
        b_0.storeBuilder(src.signedData.asBuilder());
    };
}

export function loadSignedBundle(slice: Slice) {
    const sc_0 = slice;
    const _signature = sc_0.loadBuffer(64);
    const _signedData = sc_0;
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadGetterTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function storeTupleSignedBundle(source: SignedBundle) {
    const builder = new TupleBuilder();
    builder.writeBuffer(source.signature);
    builder.writeSlice(source.signedData.asCell());
    return builder.build();
}

export function dictValueParserSignedBundle(): DictionaryValue<SignedBundle> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSignedBundle(src)).endCell());
        },
        parse: (src) => {
            return loadSignedBundle(src.loadRef().beginParse());
        }
    }
}

export type StateInit = {
    $$type: 'StateInit';
    code: Cell;
    data: Cell;
}

export function storeStateInit(src: StateInit) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeRef(src.code);
        b_0.storeRef(src.data);
    };
}

export function loadStateInit(slice: Slice) {
    const sc_0 = slice;
    const _code = sc_0.loadRef();
    const _data = sc_0.loadRef();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadGetterTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function storeTupleStateInit(source: StateInit) {
    const builder = new TupleBuilder();
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

export function dictValueParserStateInit(): DictionaryValue<StateInit> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStateInit(src)).endCell());
        },
        parse: (src) => {
            return loadStateInit(src.loadRef().beginParse());
        }
    }
}

export type Context = {
    $$type: 'Context';
    bounceable: boolean;
    sender: Address;
    value: bigint;
    raw: Slice;
}

export function storeContext(src: Context) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBit(src.bounceable);
        b_0.storeAddress(src.sender);
        b_0.storeInt(src.value, 257);
        b_0.storeRef(src.raw.asCell());
    };
}

export function loadContext(slice: Slice) {
    const sc_0 = slice;
    const _bounceable = sc_0.loadBit();
    const _sender = sc_0.loadAddress();
    const _value = sc_0.loadIntBig(257);
    const _raw = sc_0.loadRef().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadGetterTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function storeTupleContext(source: Context) {
    const builder = new TupleBuilder();
    builder.writeBoolean(source.bounceable);
    builder.writeAddress(source.sender);
    builder.writeNumber(source.value);
    builder.writeSlice(source.raw.asCell());
    return builder.build();
}

export function dictValueParserContext(): DictionaryValue<Context> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContext(src)).endCell());
        },
        parse: (src) => {
            return loadContext(src.loadRef().beginParse());
        }
    }
}

export type SendParameters = {
    $$type: 'SendParameters';
    mode: bigint;
    body: Cell | null;
    code: Cell | null;
    data: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeSendParameters(src: SendParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        if (src.code !== null && src.code !== undefined) { b_0.storeBit(true).storeRef(src.code); } else { b_0.storeBit(false); }
        if (src.data !== null && src.data !== undefined) { b_0.storeBit(true).storeRef(src.data); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadSendParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _code = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _data = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleSendParameters(source: SendParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserSendParameters(): DictionaryValue<SendParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSendParameters(src)).endCell());
        },
        parse: (src) => {
            return loadSendParameters(src.loadRef().beginParse());
        }
    }
}

export type MessageParameters = {
    $$type: 'MessageParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeMessageParameters(src: MessageParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadMessageParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleMessageParameters(source: MessageParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserMessageParameters(): DictionaryValue<MessageParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMessageParameters(src)).endCell());
        },
        parse: (src) => {
            return loadMessageParameters(src.loadRef().beginParse());
        }
    }
}

export type DeployParameters = {
    $$type: 'DeployParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    bounce: boolean;
    init: StateInit;
}

export function storeDeployParameters(src: DeployParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeBit(src.bounce);
        b_0.store(storeStateInit(src.init));
    };
}

export function loadDeployParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _bounce = sc_0.loadBit();
    const _init = loadStateInit(sc_0);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadGetterTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadGetterTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function storeTupleDeployParameters(source: DeployParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeBoolean(source.bounce);
    builder.writeTuple(storeTupleStateInit(source.init));
    return builder.build();
}

export function dictValueParserDeployParameters(): DictionaryValue<DeployParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployParameters(src)).endCell());
        },
        parse: (src) => {
            return loadDeployParameters(src.loadRef().beginParse());
        }
    }
}

export type StdAddress = {
    $$type: 'StdAddress';
    workchain: bigint;
    address: bigint;
}

export function storeStdAddress(src: StdAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 8);
        b_0.storeUint(src.address, 256);
    };
}

export function loadStdAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(8);
    const _address = sc_0.loadUintBig(256);
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleStdAddress(source: StdAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeNumber(source.address);
    return builder.build();
}

export function dictValueParserStdAddress(): DictionaryValue<StdAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStdAddress(src)).endCell());
        },
        parse: (src) => {
            return loadStdAddress(src.loadRef().beginParse());
        }
    }
}

export type VarAddress = {
    $$type: 'VarAddress';
    workchain: bigint;
    address: Slice;
}

export function storeVarAddress(src: VarAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 32);
        b_0.storeRef(src.address.asCell());
    };
}

export function loadVarAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(32);
    const _address = sc_0.loadRef().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleVarAddress(source: VarAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeSlice(source.address.asCell());
    return builder.build();
}

export function dictValueParserVarAddress(): DictionaryValue<VarAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVarAddress(src)).endCell());
        },
        parse: (src) => {
            return loadVarAddress(src.loadRef().beginParse());
        }
    }
}

export type BasechainAddress = {
    $$type: 'BasechainAddress';
    hash: bigint | null;
}

export function storeBasechainAddress(src: BasechainAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        if (src.hash !== null && src.hash !== undefined) { b_0.storeBit(true).storeInt(src.hash, 257); } else { b_0.storeBit(false); }
    };
}

export function loadBasechainAddress(slice: Slice) {
    const sc_0 = slice;
    const _hash = sc_0.loadBit() ? sc_0.loadIntBig(257) : null;
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadGetterTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function storeTupleBasechainAddress(source: BasechainAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.hash);
    return builder.build();
}

export function dictValueParserBasechainAddress(): DictionaryValue<BasechainAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBasechainAddress(src)).endCell());
        },
        parse: (src) => {
            return loadBasechainAddress(src.loadRef().beginParse());
        }
    }
}

export type DoMigrate = {
    $$type: 'DoMigrate';
}

export function storeDoMigrate(src: DoMigrate) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1024068618, 32);
    };
}

export function loadDoMigrate(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1024068618) { throw Error('Invalid prefix'); }
    return { $$type: 'DoMigrate' as const };
}

export function loadTupleDoMigrate(source: TupleReader) {
    return { $$type: 'DoMigrate' as const };
}

export function loadGetterTupleDoMigrate(source: TupleReader) {
    return { $$type: 'DoMigrate' as const };
}

export function storeTupleDoMigrate(source: DoMigrate) {
    const builder = new TupleBuilder();
    return builder.build();
}

export function dictValueParserDoMigrate(): DictionaryValue<DoMigrate> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDoMigrate(src)).endCell());
        },
        parse: (src) => {
            return loadDoMigrate(src.loadRef().beginParse());
        }
    }
}

export type DAOvote = {
    $$type: 'DAOvote';
    endTime: bigint;
    isJetton: boolean;
    isNFTSBT: boolean;
    metadata: Cell;
}

export function storeDAOvote(src: DAOvote) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1475729905, 32);
        b_0.storeUint(src.endTime, 64);
        b_0.storeBit(src.isJetton);
        b_0.storeBit(src.isNFTSBT);
        b_0.storeRef(src.metadata);
    };
}

export function loadDAOvote(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1475729905) { throw Error('Invalid prefix'); }
    const _endTime = sc_0.loadUintBig(64);
    const _isJetton = sc_0.loadBit();
    const _isNFTSBT = sc_0.loadBit();
    const _metadata = sc_0.loadRef();
    return { $$type: 'DAOvote' as const, endTime: _endTime, isJetton: _isJetton, isNFTSBT: _isNFTSBT, metadata: _metadata };
}

export function loadTupleDAOvote(source: TupleReader) {
    const _endTime = source.readBigNumber();
    const _isJetton = source.readBoolean();
    const _isNFTSBT = source.readBoolean();
    const _metadata = source.readCell();
    return { $$type: 'DAOvote' as const, endTime: _endTime, isJetton: _isJetton, isNFTSBT: _isNFTSBT, metadata: _metadata };
}

export function loadGetterTupleDAOvote(source: TupleReader) {
    const _endTime = source.readBigNumber();
    const _isJetton = source.readBoolean();
    const _isNFTSBT = source.readBoolean();
    const _metadata = source.readCell();
    return { $$type: 'DAOvote' as const, endTime: _endTime, isJetton: _isJetton, isNFTSBT: _isNFTSBT, metadata: _metadata };
}

export function storeTupleDAOvote(source: DAOvote) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.endTime);
    builder.writeBoolean(source.isJetton);
    builder.writeBoolean(source.isNFTSBT);
    builder.writeCell(source.metadata);
    return builder.build();
}

export function dictValueParserDAOvote(): DictionaryValue<DAOvote> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDAOvote(src)).endCell());
        },
        parse: (src) => {
            return loadDAOvote(src.loadRef().beginParse());
        }
    }
}

export type WhiteList = {
    $$type: 'WhiteList';
    queryId: bigint;
    jettonWallet: Address;
    jettonMaster: Address;
    jettonFee: bigint;
    amount: bigint;
    admin: Address;
}

export function storeWhiteList(src: WhiteList) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3714265888, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.jettonWallet);
        b_0.storeAddress(src.jettonMaster);
        b_0.storeCoins(src.jettonFee);
        b_0.storeCoins(src.amount);
        const b_1 = new Builder();
        b_1.storeAddress(src.admin);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadWhiteList(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3714265888) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _jettonWallet = sc_0.loadAddress();
    const _jettonMaster = sc_0.loadAddress();
    const _jettonFee = sc_0.loadCoins();
    const _amount = sc_0.loadCoins();
    const sc_1 = sc_0.loadRef().beginParse();
    const _admin = sc_1.loadAddress();
    return { $$type: 'WhiteList' as const, queryId: _queryId, jettonWallet: _jettonWallet, jettonMaster: _jettonMaster, jettonFee: _jettonFee, amount: _amount, admin: _admin };
}

export function loadTupleWhiteList(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _jettonWallet = source.readAddress();
    const _jettonMaster = source.readAddress();
    const _jettonFee = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _admin = source.readAddress();
    return { $$type: 'WhiteList' as const, queryId: _queryId, jettonWallet: _jettonWallet, jettonMaster: _jettonMaster, jettonFee: _jettonFee, amount: _amount, admin: _admin };
}

export function loadGetterTupleWhiteList(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _jettonWallet = source.readAddress();
    const _jettonMaster = source.readAddress();
    const _jettonFee = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _admin = source.readAddress();
    return { $$type: 'WhiteList' as const, queryId: _queryId, jettonWallet: _jettonWallet, jettonMaster: _jettonMaster, jettonFee: _jettonFee, amount: _amount, admin: _admin };
}

export function storeTupleWhiteList(source: WhiteList) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.jettonWallet);
    builder.writeAddress(source.jettonMaster);
    builder.writeNumber(source.jettonFee);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.admin);
    return builder.build();
}

export function dictValueParserWhiteList(): DictionaryValue<WhiteList> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeWhiteList(src)).endCell());
        },
        parse: (src) => {
            return loadWhiteList(src.loadRef().beginParse());
        }
    }
}

export type DropCollection = {
    $$type: 'DropCollection';
    queryId: bigint;
    address: Address;
}

export function storeDropCollection(src: DropCollection) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2783320816, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.address);
    };
}

export function loadDropCollection(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2783320816) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _address = sc_0.loadAddress();
    return { $$type: 'DropCollection' as const, queryId: _queryId, address: _address };
}

export function loadTupleDropCollection(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _address = source.readAddress();
    return { $$type: 'DropCollection' as const, queryId: _queryId, address: _address };
}

export function loadGetterTupleDropCollection(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _address = source.readAddress();
    return { $$type: 'DropCollection' as const, queryId: _queryId, address: _address };
}

export function storeTupleDropCollection(source: DropCollection) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.address);
    return builder.build();
}

export function dictValueParserDropCollection(): DictionaryValue<DropCollection> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDropCollection(src)).endCell());
        },
        parse: (src) => {
            return loadDropCollection(src.loadRef().beginParse());
        }
    }
}

export type ChangeAdminCitizen = {
    $$type: 'ChangeAdminCitizen';
    queryId: bigint;
    citizen: Address;
    address: Address;
}

export function storeChangeAdminCitizen(src: ChangeAdminCitizen) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(11, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.citizen);
        b_0.storeAddress(src.address);
    };
}

export function loadChangeAdminCitizen(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 11) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _citizen = sc_0.loadAddress();
    const _address = sc_0.loadAddress();
    return { $$type: 'ChangeAdminCitizen' as const, queryId: _queryId, citizen: _citizen, address: _address };
}

export function loadTupleChangeAdminCitizen(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _citizen = source.readAddress();
    const _address = source.readAddress();
    return { $$type: 'ChangeAdminCitizen' as const, queryId: _queryId, citizen: _citizen, address: _address };
}

export function loadGetterTupleChangeAdminCitizen(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _citizen = source.readAddress();
    const _address = source.readAddress();
    return { $$type: 'ChangeAdminCitizen' as const, queryId: _queryId, citizen: _citizen, address: _address };
}

export function storeTupleChangeAdminCitizen(source: ChangeAdminCitizen) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.citizen);
    builder.writeAddress(source.address);
    return builder.build();
}

export function dictValueParserChangeAdminCitizen(): DictionaryValue<ChangeAdminCitizen> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeAdminCitizen(src)).endCell());
        },
        parse: (src) => {
            return loadChangeAdminCitizen(src.loadRef().beginParse());
        }
    }
}

export type ChangeOwnerDAO = {
    $$type: 'ChangeOwnerDAO';
    queryId: bigint;
    address: Address;
}

export function storeChangeOwnerDAO(src: ChangeOwnerDAO) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(7, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.address);
    };
}

export function loadChangeOwnerDAO(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 7) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _address = sc_0.loadAddress();
    return { $$type: 'ChangeOwnerDAO' as const, queryId: _queryId, address: _address };
}

export function loadTupleChangeOwnerDAO(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _address = source.readAddress();
    return { $$type: 'ChangeOwnerDAO' as const, queryId: _queryId, address: _address };
}

export function loadGetterTupleChangeOwnerDAO(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _address = source.readAddress();
    return { $$type: 'ChangeOwnerDAO' as const, queryId: _queryId, address: _address };
}

export function storeTupleChangeOwnerDAO(source: ChangeOwnerDAO) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.address);
    return builder.build();
}

export function dictValueParserChangeOwnerDAO(): DictionaryValue<ChangeOwnerDAO> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeOwnerDAO(src)).endCell());
        },
        parse: (src) => {
            return loadChangeOwnerDAO(src.loadRef().beginParse());
        }
    }
}

export type GetFunds = {
    $$type: 'GetFunds';
    queryId: bigint;
    jettonWallet: Address;
    jettonAmount: bigint;
}

export function storeGetFunds(src: GetFunds) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(8, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.jettonWallet);
        b_0.storeCoins(src.jettonAmount);
    };
}

export function loadGetFunds(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 8) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _jettonWallet = sc_0.loadAddress();
    const _jettonAmount = sc_0.loadCoins();
    return { $$type: 'GetFunds' as const, queryId: _queryId, jettonWallet: _jettonWallet, jettonAmount: _jettonAmount };
}

export function loadTupleGetFunds(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _jettonWallet = source.readAddress();
    const _jettonAmount = source.readBigNumber();
    return { $$type: 'GetFunds' as const, queryId: _queryId, jettonWallet: _jettonWallet, jettonAmount: _jettonAmount };
}

export function loadGetterTupleGetFunds(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _jettonWallet = source.readAddress();
    const _jettonAmount = source.readBigNumber();
    return { $$type: 'GetFunds' as const, queryId: _queryId, jettonWallet: _jettonWallet, jettonAmount: _jettonAmount };
}

export function storeTupleGetFunds(source: GetFunds) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.jettonWallet);
    builder.writeNumber(source.jettonAmount);
    return builder.build();
}

export function dictValueParserGetFunds(): DictionaryValue<GetFunds> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeGetFunds(src)).endCell());
        },
        parse: (src) => {
            return loadGetFunds(src.loadRef().beginParse());
        }
    }
}

export type AddAdmin = {
    $$type: 'AddAdmin';
    queryId: bigint;
    address: Address;
}

export function storeAddAdmin(src: AddAdmin) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(9, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.address);
    };
}

export function loadAddAdmin(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 9) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _address = sc_0.loadAddress();
    return { $$type: 'AddAdmin' as const, queryId: _queryId, address: _address };
}

export function loadTupleAddAdmin(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _address = source.readAddress();
    return { $$type: 'AddAdmin' as const, queryId: _queryId, address: _address };
}

export function loadGetterTupleAddAdmin(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _address = source.readAddress();
    return { $$type: 'AddAdmin' as const, queryId: _queryId, address: _address };
}

export function storeTupleAddAdmin(source: AddAdmin) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.address);
    return builder.build();
}

export function dictValueParserAddAdmin(): DictionaryValue<AddAdmin> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeAddAdmin(src)).endCell());
        },
        parse: (src) => {
            return loadAddAdmin(src.loadRef().beginParse());
        }
    }
}

export type RemoveAdmin = {
    $$type: 'RemoveAdmin';
    queryId: bigint;
    address: Address;
}

export function storeRemoveAdmin(src: RemoveAdmin) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(10, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.address);
    };
}

export function loadRemoveAdmin(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 10) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _address = sc_0.loadAddress();
    return { $$type: 'RemoveAdmin' as const, queryId: _queryId, address: _address };
}

export function loadTupleRemoveAdmin(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _address = source.readAddress();
    return { $$type: 'RemoveAdmin' as const, queryId: _queryId, address: _address };
}

export function loadGetterTupleRemoveAdmin(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _address = source.readAddress();
    return { $$type: 'RemoveAdmin' as const, queryId: _queryId, address: _address };
}

export function storeTupleRemoveAdmin(source: RemoveAdmin) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.address);
    return builder.build();
}

export function dictValueParserRemoveAdmin(): DictionaryValue<RemoveAdmin> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRemoveAdmin(src)).endCell());
        },
        parse: (src) => {
            return loadRemoveAdmin(src.loadRef().beginParse());
        }
    }
}

export type ChangeTreasury = {
    $$type: 'ChangeTreasury';
    queryId: bigint;
    address: Address;
}

export function storeChangeTreasury(src: ChangeTreasury) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(12, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.address);
    };
}

export function loadChangeTreasury(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 12) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _address = sc_0.loadAddress();
    return { $$type: 'ChangeTreasury' as const, queryId: _queryId, address: _address };
}

export function loadTupleChangeTreasury(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _address = source.readAddress();
    return { $$type: 'ChangeTreasury' as const, queryId: _queryId, address: _address };
}

export function loadGetterTupleChangeTreasury(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _address = source.readAddress();
    return { $$type: 'ChangeTreasury' as const, queryId: _queryId, address: _address };
}

export function storeTupleChangeTreasury(source: ChangeTreasury) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.address);
    return builder.build();
}

export function dictValueParserChangeTreasury(): DictionaryValue<ChangeTreasury> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeTreasury(src)).endCell());
        },
        parse: (src) => {
            return loadChangeTreasury(src.loadRef().beginParse());
        }
    }
}

export type JettonTransferNotification = {
    $$type: 'JettonTransferNotification';
    queryId: bigint;
    amount: bigint;
    sender: Address;
    forwardPayload: Slice;
}

export function storeJettonTransferNotification(src: JettonTransferNotification) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1935855772, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.sender);
        b_0.storeBuilder(src.forwardPayload.asBuilder());
    };
}

export function loadJettonTransferNotification(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1935855772) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _amount = sc_0.loadCoins();
    const _sender = sc_0.loadAddress();
    const _forwardPayload = sc_0;
    return { $$type: 'JettonTransferNotification' as const, queryId: _queryId, amount: _amount, sender: _sender, forwardPayload: _forwardPayload };
}

export function loadTupleJettonTransferNotification(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _sender = source.readAddress();
    const _forwardPayload = source.readCell().asSlice();
    return { $$type: 'JettonTransferNotification' as const, queryId: _queryId, amount: _amount, sender: _sender, forwardPayload: _forwardPayload };
}

export function loadGetterTupleJettonTransferNotification(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _sender = source.readAddress();
    const _forwardPayload = source.readCell().asSlice();
    return { $$type: 'JettonTransferNotification' as const, queryId: _queryId, amount: _amount, sender: _sender, forwardPayload: _forwardPayload };
}

export function storeTupleJettonTransferNotification(source: JettonTransferNotification) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.sender);
    builder.writeSlice(source.forwardPayload.asCell());
    return builder.build();
}

export function dictValueParserJettonTransferNotification(): DictionaryValue<JettonTransferNotification> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonTransferNotification(src)).endCell());
        },
        parse: (src) => {
            return loadJettonTransferNotification(src.loadRef().beginParse());
        }
    }
}

export type StartNewVoting = {
    $$type: 'StartNewVoting';
    metadata: Cell;
    settings: VoteSettings;
}

export function storeStartNewVoting(src: StartNewVoting) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3100530816, 32);
        b_0.storeRef(src.metadata);
        b_0.store(storeVoteSettings(src.settings));
    };
}

export function loadStartNewVoting(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3100530816) { throw Error('Invalid prefix'); }
    const _metadata = sc_0.loadRef();
    const _settings = loadVoteSettings(sc_0);
    return { $$type: 'StartNewVoting' as const, metadata: _metadata, settings: _settings };
}

export function loadTupleStartNewVoting(source: TupleReader) {
    const _metadata = source.readCell();
    const _settings = loadTupleVoteSettings(source);
    return { $$type: 'StartNewVoting' as const, metadata: _metadata, settings: _settings };
}

export function loadGetterTupleStartNewVoting(source: TupleReader) {
    const _metadata = source.readCell();
    const _settings = loadGetterTupleVoteSettings(source);
    return { $$type: 'StartNewVoting' as const, metadata: _metadata, settings: _settings };
}

export function storeTupleStartNewVoting(source: StartNewVoting) {
    const builder = new TupleBuilder();
    builder.writeCell(source.metadata);
    builder.writeTuple(storeTupleVoteSettings(source.settings));
    return builder.build();
}

export function dictValueParserStartNewVoting(): DictionaryValue<StartNewVoting> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStartNewVoting(src)).endCell());
        },
        parse: (src) => {
            return loadStartNewVoting(src.loadRef().beginParse());
        }
    }
}

export type StartDAOVoting = {
    $$type: 'StartDAOVoting';
    queryId: bigint;
    metadata: Cell;
    settings: VoteSettings;
}

export function storeStartDAOVoting(src: StartDAOVoting) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(718541994, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeRef(src.metadata);
        b_0.store(storeVoteSettings(src.settings));
    };
}

export function loadStartDAOVoting(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 718541994) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _metadata = sc_0.loadRef();
    const _settings = loadVoteSettings(sc_0);
    return { $$type: 'StartDAOVoting' as const, queryId: _queryId, metadata: _metadata, settings: _settings };
}

export function loadTupleStartDAOVoting(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _metadata = source.readCell();
    const _settings = loadTupleVoteSettings(source);
    return { $$type: 'StartDAOVoting' as const, queryId: _queryId, metadata: _metadata, settings: _settings };
}

export function loadGetterTupleStartDAOVoting(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _metadata = source.readCell();
    const _settings = loadGetterTupleVoteSettings(source);
    return { $$type: 'StartDAOVoting' as const, queryId: _queryId, metadata: _metadata, settings: _settings };
}

export function storeTupleStartDAOVoting(source: StartDAOVoting) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeCell(source.metadata);
    builder.writeTuple(storeTupleVoteSettings(source.settings));
    return builder.build();
}

export function dictValueParserStartDAOVoting(): DictionaryValue<StartDAOVoting> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStartDAOVoting(src)).endCell());
        },
        parse: (src) => {
            return loadStartDAOVoting(src.loadRef().beginParse());
        }
    }
}

export type InitVoting = {
    $$type: 'InitVoting';
    queryId: bigint;
    totalSupply: bigint;
}

export function storeInitVoting(src: InitVoting) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1440328515, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeCoins(src.totalSupply);
    };
}

export function loadInitVoting(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1440328515) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _totalSupply = sc_0.loadCoins();
    return { $$type: 'InitVoting' as const, queryId: _queryId, totalSupply: _totalSupply };
}

export function loadTupleInitVoting(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _totalSupply = source.readBigNumber();
    return { $$type: 'InitVoting' as const, queryId: _queryId, totalSupply: _totalSupply };
}

export function loadGetterTupleInitVoting(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _totalSupply = source.readBigNumber();
    return { $$type: 'InitVoting' as const, queryId: _queryId, totalSupply: _totalSupply };
}

export function storeTupleInitVoting(source: InitVoting) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.totalSupply);
    return builder.build();
}

export function dictValueParserInitVoting(): DictionaryValue<InitVoting> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeInitVoting(src)).endCell());
        },
        parse: (src) => {
            return loadInitVoting(src.loadRef().beginParse());
        }
    }
}

export type ActivateVote = {
    $$type: 'ActivateVote';
    contractAddress: Address;
    admin: Address;
}

export function storeActivateVote(src: ActivateVote) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(690358848, 32);
        b_0.storeAddress(src.contractAddress);
        b_0.storeAddress(src.admin);
    };
}

export function loadActivateVote(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 690358848) { throw Error('Invalid prefix'); }
    const _contractAddress = sc_0.loadAddress();
    const _admin = sc_0.loadAddress();
    return { $$type: 'ActivateVote' as const, contractAddress: _contractAddress, admin: _admin };
}

export function loadTupleActivateVote(source: TupleReader) {
    const _contractAddress = source.readAddress();
    const _admin = source.readAddress();
    return { $$type: 'ActivateVote' as const, contractAddress: _contractAddress, admin: _admin };
}

export function loadGetterTupleActivateVote(source: TupleReader) {
    const _contractAddress = source.readAddress();
    const _admin = source.readAddress();
    return { $$type: 'ActivateVote' as const, contractAddress: _contractAddress, admin: _admin };
}

export function storeTupleActivateVote(source: ActivateVote) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.contractAddress);
    builder.writeAddress(source.admin);
    return builder.build();
}

export function dictValueParserActivateVote(): DictionaryValue<ActivateVote> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeActivateVote(src)).endCell());
        },
        parse: (src) => {
            return loadActivateVote(src.loadRef().beginParse());
        }
    }
}

export type CallVote = {
    $$type: 'CallVote';
    queryId: bigint;
}

export function storeCallVote(src: CallVote) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(435109211, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadCallVote(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 435109211) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'CallVote' as const, queryId: _queryId };
}

export function loadTupleCallVote(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'CallVote' as const, queryId: _queryId };
}

export function loadGetterTupleCallVote(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'CallVote' as const, queryId: _queryId };
}

export function storeTupleCallVote(source: CallVote) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserCallVote(): DictionaryValue<CallVote> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeCallVote(src)).endCell());
        },
        parse: (src) => {
            return loadCallVote(src.loadRef().beginParse());
        }
    }
}

export type GiveVote = {
    $$type: 'GiveVote';
    queryId: bigint;
}

export function storeGiveVote(src: GiveVote) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3041426889, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadGiveVote(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3041426889) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'GiveVote' as const, queryId: _queryId };
}

export function loadTupleGiveVote(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'GiveVote' as const, queryId: _queryId };
}

export function loadGetterTupleGiveVote(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'GiveVote' as const, queryId: _queryId };
}

export function storeTupleGiveVote(source: GiveVote) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserGiveVote(): DictionaryValue<GiveVote> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeGiveVote(src)).endCell());
        },
        parse: (src) => {
            return loadGiveVote(src.loadRef().beginParse());
        }
    }
}

export type TakeVote = {
    $$type: 'TakeVote';
    queryId: bigint;
}

export function storeTakeVote(src: TakeVote) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3958568142, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadTakeVote(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3958568142) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'TakeVote' as const, queryId: _queryId };
}

export function loadTupleTakeVote(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'TakeVote' as const, queryId: _queryId };
}

export function loadGetterTupleTakeVote(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'TakeVote' as const, queryId: _queryId };
}

export function storeTupleTakeVote(source: TakeVote) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserTakeVote(): DictionaryValue<TakeVote> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTakeVote(src)).endCell());
        },
        parse: (src) => {
            return loadTakeVote(src.loadRef().beginParse());
        }
    }
}

export type TakeDAOVote = {
    $$type: 'TakeDAOVote';
    adminAddress: Address;
    optionAddress: Address;
}

export function storeTakeDAOVote(src: TakeDAOVote) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3914228146, 32);
        b_0.storeAddress(src.adminAddress);
        b_0.storeAddress(src.optionAddress);
    };
}

export function loadTakeDAOVote(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3914228146) { throw Error('Invalid prefix'); }
    const _adminAddress = sc_0.loadAddress();
    const _optionAddress = sc_0.loadAddress();
    return { $$type: 'TakeDAOVote' as const, adminAddress: _adminAddress, optionAddress: _optionAddress };
}

export function loadTupleTakeDAOVote(source: TupleReader) {
    const _adminAddress = source.readAddress();
    const _optionAddress = source.readAddress();
    return { $$type: 'TakeDAOVote' as const, adminAddress: _adminAddress, optionAddress: _optionAddress };
}

export function loadGetterTupleTakeDAOVote(source: TupleReader) {
    const _adminAddress = source.readAddress();
    const _optionAddress = source.readAddress();
    return { $$type: 'TakeDAOVote' as const, adminAddress: _adminAddress, optionAddress: _optionAddress };
}

export function storeTupleTakeDAOVote(source: TakeDAOVote) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.adminAddress);
    builder.writeAddress(source.optionAddress);
    return builder.build();
}

export function dictValueParserTakeDAOVote(): DictionaryValue<TakeDAOVote> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTakeDAOVote(src)).endCell());
        },
        parse: (src) => {
            return loadTakeDAOVote(src.loadRef().beginParse());
        }
    }
}

export type PassPassport = {
    $$type: 'PassPassport';
    queryId: bigint;
    address: Address;
}

export function storePassPassport(src: PassPassport) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(57069, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.address);
    };
}

export function loadPassPassport(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 57069) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _address = sc_0.loadAddress();
    return { $$type: 'PassPassport' as const, queryId: _queryId, address: _address };
}

export function loadTuplePassPassport(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _address = source.readAddress();
    return { $$type: 'PassPassport' as const, queryId: _queryId, address: _address };
}

export function loadGetterTuplePassPassport(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _address = source.readAddress();
    return { $$type: 'PassPassport' as const, queryId: _queryId, address: _address };
}

export function storeTuplePassPassport(source: PassPassport) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.address);
    return builder.build();
}

export function dictValueParserPassPassport(): DictionaryValue<PassPassport> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storePassPassport(src)).endCell());
        },
        parse: (src) => {
            return loadPassPassport(src.loadRef().beginParse());
        }
    }
}

export type SetToken = {
    $$type: 'SetToken';
    dao_fee: bigint;
}

export function storeSetToken(src: SetToken) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3233865037, 32);
        b_0.storeCoins(src.dao_fee);
    };
}

export function loadSetToken(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3233865037) { throw Error('Invalid prefix'); }
    const _dao_fee = sc_0.loadCoins();
    return { $$type: 'SetToken' as const, dao_fee: _dao_fee };
}

export function loadTupleSetToken(source: TupleReader) {
    const _dao_fee = source.readBigNumber();
    return { $$type: 'SetToken' as const, dao_fee: _dao_fee };
}

export function loadGetterTupleSetToken(source: TupleReader) {
    const _dao_fee = source.readBigNumber();
    return { $$type: 'SetToken' as const, dao_fee: _dao_fee };
}

export function storeTupleSetToken(source: SetToken) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.dao_fee);
    return builder.build();
}

export function dictValueParserSetToken(): DictionaryValue<SetToken> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetToken(src)).endCell());
        },
        parse: (src) => {
            return loadSetToken(src.loadRef().beginParse());
        }
    }
}

export type AddOption = {
    $$type: 'AddOption';
    queryId: bigint;
    title: string;
    description: string;
}

export function storeAddOption(src: AddOption) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3367105963, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeStringRefTail(src.title);
        b_0.storeStringRefTail(src.description);
    };
}

export function loadAddOption(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3367105963) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _title = sc_0.loadStringRefTail();
    const _description = sc_0.loadStringRefTail();
    return { $$type: 'AddOption' as const, queryId: _queryId, title: _title, description: _description };
}

export function loadTupleAddOption(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _title = source.readString();
    const _description = source.readString();
    return { $$type: 'AddOption' as const, queryId: _queryId, title: _title, description: _description };
}

export function loadGetterTupleAddOption(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _title = source.readString();
    const _description = source.readString();
    return { $$type: 'AddOption' as const, queryId: _queryId, title: _title, description: _description };
}

export function storeTupleAddOption(source: AddOption) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeString(source.title);
    builder.writeString(source.description);
    return builder.build();
}

export function dictValueParserAddOption(): DictionaryValue<AddOption> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeAddOption(src)).endCell());
        },
        parse: (src) => {
            return loadAddOption(src.loadRef().beginParse());
        }
    }
}

export type VaultInitialization = {
    $$type: 'VaultInitialization';
    queryId: bigint;
    admin: Address;
}

export function storeVaultInitialization(src: VaultInitialization) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3683237002, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.admin);
    };
}

export function loadVaultInitialization(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3683237002) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _admin = sc_0.loadAddress();
    return { $$type: 'VaultInitialization' as const, queryId: _queryId, admin: _admin };
}

export function loadTupleVaultInitialization(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _admin = source.readAddress();
    return { $$type: 'VaultInitialization' as const, queryId: _queryId, admin: _admin };
}

export function loadGetterTupleVaultInitialization(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _admin = source.readAddress();
    return { $$type: 'VaultInitialization' as const, queryId: _queryId, admin: _admin };
}

export function storeTupleVaultInitialization(source: VaultInitialization) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.admin);
    return builder.build();
}

export function dictValueParserVaultInitialization(): DictionaryValue<VaultInitialization> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVaultInitialization(src)).endCell());
        },
        parse: (src) => {
            return loadVaultInitialization(src.loadRef().beginParse());
        }
    }
}

export type VirtualInitialization = {
    $$type: 'VirtualInitialization';
    queryId: bigint;
    optionAddress: Address;
}

export function storeVirtualInitialization(src: VirtualInitialization) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(226213212, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.optionAddress);
    };
}

export function loadVirtualInitialization(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 226213212) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _optionAddress = sc_0.loadAddress();
    return { $$type: 'VirtualInitialization' as const, queryId: _queryId, optionAddress: _optionAddress };
}

export function loadTupleVirtualInitialization(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _optionAddress = source.readAddress();
    return { $$type: 'VirtualInitialization' as const, queryId: _queryId, optionAddress: _optionAddress };
}

export function loadGetterTupleVirtualInitialization(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _optionAddress = source.readAddress();
    return { $$type: 'VirtualInitialization' as const, queryId: _queryId, optionAddress: _optionAddress };
}

export function storeTupleVirtualInitialization(source: VirtualInitialization) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.optionAddress);
    return builder.build();
}

export function dictValueParserVirtualInitialization(): DictionaryValue<VirtualInitialization> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVirtualInitialization(src)).endCell());
        },
        parse: (src) => {
            return loadVirtualInitialization(src.loadRef().beginParse());
        }
    }
}

export type SubmitVoting = {
    $$type: 'SubmitVoting';
    queryId: bigint;
    adminAddress: Address;
    optionAddress: Address;
}

export function storeSubmitVoting(src: SubmitVoting) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(4022960818, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.adminAddress);
        b_0.storeAddress(src.optionAddress);
    };
}

export function loadSubmitVoting(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 4022960818) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _adminAddress = sc_0.loadAddress();
    const _optionAddress = sc_0.loadAddress();
    return { $$type: 'SubmitVoting' as const, queryId: _queryId, adminAddress: _adminAddress, optionAddress: _optionAddress };
}

export function loadTupleSubmitVoting(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _adminAddress = source.readAddress();
    const _optionAddress = source.readAddress();
    return { $$type: 'SubmitVoting' as const, queryId: _queryId, adminAddress: _adminAddress, optionAddress: _optionAddress };
}

export function loadGetterTupleSubmitVoting(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _adminAddress = source.readAddress();
    const _optionAddress = source.readAddress();
    return { $$type: 'SubmitVoting' as const, queryId: _queryId, adminAddress: _adminAddress, optionAddress: _optionAddress };
}

export function storeTupleSubmitVoting(source: SubmitVoting) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.adminAddress);
    builder.writeAddress(source.optionAddress);
    return builder.build();
}

export function dictValueParserSubmitVoting(): DictionaryValue<SubmitVoting> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSubmitVoting(src)).endCell());
        },
        parse: (src) => {
            return loadSubmitVoting(src.loadRef().beginParse());
        }
    }
}

export type CancelVoting = {
    $$type: 'CancelVoting';
    queryId: bigint;
    adminAddress: Address;
    optionAddress: Address;
}

export function storeCancelVoting(src: CancelVoting) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(502754399, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.adminAddress);
        b_0.storeAddress(src.optionAddress);
    };
}

export function loadCancelVoting(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 502754399) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _adminAddress = sc_0.loadAddress();
    const _optionAddress = sc_0.loadAddress();
    return { $$type: 'CancelVoting' as const, queryId: _queryId, adminAddress: _adminAddress, optionAddress: _optionAddress };
}

export function loadTupleCancelVoting(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _adminAddress = source.readAddress();
    const _optionAddress = source.readAddress();
    return { $$type: 'CancelVoting' as const, queryId: _queryId, adminAddress: _adminAddress, optionAddress: _optionAddress };
}

export function loadGetterTupleCancelVoting(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _adminAddress = source.readAddress();
    const _optionAddress = source.readAddress();
    return { $$type: 'CancelVoting' as const, queryId: _queryId, adminAddress: _adminAddress, optionAddress: _optionAddress };
}

export function storeTupleCancelVoting(source: CancelVoting) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.adminAddress);
    builder.writeAddress(source.optionAddress);
    return builder.build();
}

export function dictValueParserCancelVoting(): DictionaryValue<CancelVoting> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeCancelVoting(src)).endCell());
        },
        parse: (src) => {
            return loadCancelVoting(src.loadRef().beginParse());
        }
    }
}

export type ProvideAction = {
    $$type: 'ProvideAction';
    queryId: bigint;
    address: Address;
    payload: Cell;
}

export function storeProvideAction(src: ProvideAction) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(385206731, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.address);
        b_0.storeRef(src.payload);
    };
}

export function loadProvideAction(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 385206731) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _address = sc_0.loadAddress();
    const _payload = sc_0.loadRef();
    return { $$type: 'ProvideAction' as const, queryId: _queryId, address: _address, payload: _payload };
}

export function loadTupleProvideAction(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _address = source.readAddress();
    const _payload = source.readCell();
    return { $$type: 'ProvideAction' as const, queryId: _queryId, address: _address, payload: _payload };
}

export function loadGetterTupleProvideAction(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _address = source.readAddress();
    const _payload = source.readCell();
    return { $$type: 'ProvideAction' as const, queryId: _queryId, address: _address, payload: _payload };
}

export function storeTupleProvideAction(source: ProvideAction) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.address);
    builder.writeCell(source.payload);
    return builder.build();
}

export function dictValueParserProvideAction(): DictionaryValue<ProvideAction> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeProvideAction(src)).endCell());
        },
        parse: (src) => {
            return loadProvideAction(src.loadRef().beginParse());
        }
    }
}

export type ProvideActionDAO = {
    $$type: 'ProvideActionDAO';
    queryId: bigint;
    admin: Address;
    payload: Cell;
}

export function storeProvideActionDAO(src: ProvideActionDAO) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1847741543, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.admin);
        b_0.storeRef(src.payload);
    };
}

export function loadProvideActionDAO(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1847741543) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _admin = sc_0.loadAddress();
    const _payload = sc_0.loadRef();
    return { $$type: 'ProvideActionDAO' as const, queryId: _queryId, admin: _admin, payload: _payload };
}

export function loadTupleProvideActionDAO(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _admin = source.readAddress();
    const _payload = source.readCell();
    return { $$type: 'ProvideActionDAO' as const, queryId: _queryId, admin: _admin, payload: _payload };
}

export function loadGetterTupleProvideActionDAO(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _admin = source.readAddress();
    const _payload = source.readCell();
    return { $$type: 'ProvideActionDAO' as const, queryId: _queryId, admin: _admin, payload: _payload };
}

export function storeTupleProvideActionDAO(source: ProvideActionDAO) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.admin);
    builder.writeCell(source.payload);
    return builder.build();
}

export function dictValueParserProvideActionDAO(): DictionaryValue<ProvideActionDAO> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeProvideActionDAO(src)).endCell());
        },
        parse: (src) => {
            return loadProvideActionDAO(src.loadRef().beginParse());
        }
    }
}

export type ProvideVoting = {
    $$type: 'ProvideVoting';
    optionAddress: Address;
}

export function storeProvideVoting(src: ProvideVoting) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(943290294, 32);
        b_0.storeAddress(src.optionAddress);
    };
}

export function loadProvideVoting(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 943290294) { throw Error('Invalid prefix'); }
    const _optionAddress = sc_0.loadAddress();
    return { $$type: 'ProvideVoting' as const, optionAddress: _optionAddress };
}

export function loadTupleProvideVoting(source: TupleReader) {
    const _optionAddress = source.readAddress();
    return { $$type: 'ProvideVoting' as const, optionAddress: _optionAddress };
}

export function loadGetterTupleProvideVoting(source: TupleReader) {
    const _optionAddress = source.readAddress();
    return { $$type: 'ProvideVoting' as const, optionAddress: _optionAddress };
}

export function storeTupleProvideVoting(source: ProvideVoting) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.optionAddress);
    return builder.build();
}

export function dictValueParserProvideVoting(): DictionaryValue<ProvideVoting> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeProvideVoting(src)).endCell());
        },
        parse: (src) => {
            return loadProvideVoting(src.loadRef().beginParse());
        }
    }
}

export type PassportControl = {
    $$type: 'PassportControl';
    queryId: bigint;
    citizen: Address;
    status: bigint;
}

export function storePassportControl(src: PassportControl) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3735928559, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.citizen);
        b_0.storeUint(src.status, 4);
    };
}

export function loadPassportControl(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3735928559) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _citizen = sc_0.loadAddress();
    const _status = sc_0.loadUintBig(4);
    return { $$type: 'PassportControl' as const, queryId: _queryId, citizen: _citizen, status: _status };
}

export function loadTuplePassportControl(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _citizen = source.readAddress();
    const _status = source.readBigNumber();
    return { $$type: 'PassportControl' as const, queryId: _queryId, citizen: _citizen, status: _status };
}

export function loadGetterTuplePassportControl(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _citizen = source.readAddress();
    const _status = source.readBigNumber();
    return { $$type: 'PassportControl' as const, queryId: _queryId, citizen: _citizen, status: _status };
}

export function storeTuplePassportControl(source: PassportControl) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.citizen);
    builder.writeNumber(source.status);
    return builder.build();
}

export function dictValueParserPassportControl(): DictionaryValue<PassportControl> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storePassportControl(src)).endCell());
        },
        parse: (src) => {
            return loadPassportControl(src.loadRef().beginParse());
        }
    }
}

export type CreateDao = {
    $$type: 'CreateDao';
    queryId: bigint;
    metadata: Cell;
    config: DaoConfig;
}

export function storeCreateDao(src: CreateDao) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1024068608, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeRef(src.metadata);
        b_0.store(storeDaoConfig(src.config));
    };
}

export function loadCreateDao(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1024068608) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _metadata = sc_0.loadRef();
    const _config = loadDaoConfig(sc_0);
    return { $$type: 'CreateDao' as const, queryId: _queryId, metadata: _metadata, config: _config };
}

export function loadTupleCreateDao(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _metadata = source.readCell();
    const _config = loadTupleDaoConfig(source);
    return { $$type: 'CreateDao' as const, queryId: _queryId, metadata: _metadata, config: _config };
}

export function loadGetterTupleCreateDao(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _metadata = source.readCell();
    const _config = loadGetterTupleDaoConfig(source);
    return { $$type: 'CreateDao' as const, queryId: _queryId, metadata: _metadata, config: _config };
}

export function storeTupleCreateDao(source: CreateDao) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeCell(source.metadata);
    builder.writeTuple(storeTupleDaoConfig(source.config));
    return builder.build();
}

export function dictValueParserCreateDao(): DictionaryValue<CreateDao> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeCreateDao(src)).endCell());
        },
        parse: (src) => {
            return loadCreateDao(src.loadRef().beginParse());
        }
    }
}

export type InitDaoWallet = {
    $$type: 'InitDaoWallet';
    queryId: bigint;
}

export function storeInitDaoWallet(src: InitDaoWallet) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1024068609, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadInitDaoWallet(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1024068609) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'InitDaoWallet' as const, queryId: _queryId };
}

export function loadTupleInitDaoWallet(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'InitDaoWallet' as const, queryId: _queryId };
}

export function loadGetterTupleInitDaoWallet(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'InitDaoWallet' as const, queryId: _queryId };
}

export function storeTupleInitDaoWallet(source: InitDaoWallet) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserInitDaoWallet(): DictionaryValue<InitDaoWallet> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeInitDaoWallet(src)).endCell());
        },
        parse: (src) => {
            return loadInitDaoWallet(src.loadRef().beginParse());
        }
    }
}

export type CreateVotingReq = {
    $$type: 'CreateVotingReq';
    queryId: bigint;
    metadata: Cell;
    settings: VoteSettings;
    action: DaoAction;
}

export function storeCreateVotingReq(src: CreateVotingReq) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1024068610, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeRef(src.metadata);
        b_0.store(storeVoteSettings(src.settings));
        const b_1 = new Builder();
        b_1.store(storeDaoAction(src.action));
        b_0.storeRef(b_1.endCell());
    };
}

export function loadCreateVotingReq(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1024068610) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _metadata = sc_0.loadRef();
    const _settings = loadVoteSettings(sc_0);
    const sc_1 = sc_0.loadRef().beginParse();
    const _action = loadDaoAction(sc_1);
    return { $$type: 'CreateVotingReq' as const, queryId: _queryId, metadata: _metadata, settings: _settings, action: _action };
}

export function loadTupleCreateVotingReq(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _metadata = source.readCell();
    const _settings = loadTupleVoteSettings(source);
    const _action = loadTupleDaoAction(source);
    return { $$type: 'CreateVotingReq' as const, queryId: _queryId, metadata: _metadata, settings: _settings, action: _action };
}

export function loadGetterTupleCreateVotingReq(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _metadata = source.readCell();
    const _settings = loadGetterTupleVoteSettings(source);
    const _action = loadGetterTupleDaoAction(source);
    return { $$type: 'CreateVotingReq' as const, queryId: _queryId, metadata: _metadata, settings: _settings, action: _action };
}

export function storeTupleCreateVotingReq(source: CreateVotingReq) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeCell(source.metadata);
    builder.writeTuple(storeTupleVoteSettings(source.settings));
    builder.writeTuple(storeTupleDaoAction(source.action));
    return builder.build();
}

export function dictValueParserCreateVotingReq(): DictionaryValue<CreateVotingReq> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeCreateVotingReq(src)).endCell());
        },
        parse: (src) => {
            return loadCreateVotingReq(src.loadRef().beginParse());
        }
    }
}

export type VotingFinished = {
    $$type: 'VotingFinished';
    queryId: bigint;
    winner: Address | null;
    total: bigint;
}

export function storeVotingFinished(src: VotingFinished) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1024068611, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.winner);
        b_0.storeUint(src.total, 64);
    };
}

export function loadVotingFinished(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1024068611) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _winner = sc_0.loadMaybeAddress();
    const _total = sc_0.loadUintBig(64);
    return { $$type: 'VotingFinished' as const, queryId: _queryId, winner: _winner, total: _total };
}

export function loadTupleVotingFinished(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _winner = source.readAddressOpt();
    const _total = source.readBigNumber();
    return { $$type: 'VotingFinished' as const, queryId: _queryId, winner: _winner, total: _total };
}

export function loadGetterTupleVotingFinished(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _winner = source.readAddressOpt();
    const _total = source.readBigNumber();
    return { $$type: 'VotingFinished' as const, queryId: _queryId, winner: _winner, total: _total };
}

export function storeTupleVotingFinished(source: VotingFinished) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.winner);
    builder.writeNumber(source.total);
    return builder.build();
}

export function dictValueParserVotingFinished(): DictionaryValue<VotingFinished> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVotingFinished(src)).endCell());
        },
        parse: (src) => {
            return loadVotingFinished(src.loadRef().beginParse());
        }
    }
}

export type SetVerified = {
    $$type: 'SetVerified';
    queryId: bigint;
    verified: boolean;
}

export function storeSetVerified(src: SetVerified) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1024068612, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeBit(src.verified);
    };
}

export function loadSetVerified(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1024068612) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _verified = sc_0.loadBit();
    return { $$type: 'SetVerified' as const, queryId: _queryId, verified: _verified };
}

export function loadTupleSetVerified(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _verified = source.readBoolean();
    return { $$type: 'SetVerified' as const, queryId: _queryId, verified: _verified };
}

export function loadGetterTupleSetVerified(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _verified = source.readBoolean();
    return { $$type: 'SetVerified' as const, queryId: _queryId, verified: _verified };
}

export function storeTupleSetVerified(source: SetVerified) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeBoolean(source.verified);
    return builder.build();
}

export function dictValueParserSetVerified(): DictionaryValue<SetVerified> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetVerified(src)).endCell());
        },
        parse: (src) => {
            return loadSetVerified(src.loadRef().beginParse());
        }
    }
}

export type MarkDao = {
    $$type: 'MarkDao';
    queryId: bigint;
    dao: Address;
    verified: boolean;
}

export function storeMarkDao(src: MarkDao) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1024068613, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.dao);
        b_0.storeBit(src.verified);
    };
}

export function loadMarkDao(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1024068613) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _dao = sc_0.loadAddress();
    const _verified = sc_0.loadBit();
    return { $$type: 'MarkDao' as const, queryId: _queryId, dao: _dao, verified: _verified };
}

export function loadTupleMarkDao(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _dao = source.readAddress();
    const _verified = source.readBoolean();
    return { $$type: 'MarkDao' as const, queryId: _queryId, dao: _dao, verified: _verified };
}

export function loadGetterTupleMarkDao(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _dao = source.readAddress();
    const _verified = source.readBoolean();
    return { $$type: 'MarkDao' as const, queryId: _queryId, dao: _dao, verified: _verified };
}

export function storeTupleMarkDao(source: MarkDao) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.dao);
    builder.writeBoolean(source.verified);
    return builder.build();
}

export function dictValueParserMarkDao(): DictionaryValue<MarkDao> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMarkDao(src)).endCell());
        },
        parse: (src) => {
            return loadMarkDao(src.loadRef().beginParse());
        }
    }
}

export type UpgradeCode = {
    $$type: 'UpgradeCode';
    queryId: bigint;
    code: Cell;
}

export function storeUpgradeCode(src: UpgradeCode) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1024068614, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeRef(src.code);
    };
}

export function loadUpgradeCode(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1024068614) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _code = sc_0.loadRef();
    return { $$type: 'UpgradeCode' as const, queryId: _queryId, code: _code };
}

export function loadTupleUpgradeCode(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _code = source.readCell();
    return { $$type: 'UpgradeCode' as const, queryId: _queryId, code: _code };
}

export function loadGetterTupleUpgradeCode(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _code = source.readCell();
    return { $$type: 'UpgradeCode' as const, queryId: _queryId, code: _code };
}

export function storeTupleUpgradeCode(source: UpgradeCode) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeCell(source.code);
    return builder.build();
}

export function dictValueParserUpgradeCode(): DictionaryValue<UpgradeCode> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUpgradeCode(src)).endCell());
        },
        parse: (src) => {
            return loadUpgradeCode(src.loadRef().beginParse());
        }
    }
}

export type BindJettonWallet = {
    $$type: 'BindJettonWallet';
    queryId: bigint;
    wallet: Address;
}

export function storeBindJettonWallet(src: BindJettonWallet) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1024068640, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.wallet);
    };
}

export function loadBindJettonWallet(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1024068640) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _wallet = sc_0.loadAddress();
    return { $$type: 'BindJettonWallet' as const, queryId: _queryId, wallet: _wallet };
}

export function loadTupleBindJettonWallet(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _wallet = source.readAddress();
    return { $$type: 'BindJettonWallet' as const, queryId: _queryId, wallet: _wallet };
}

export function loadGetterTupleBindJettonWallet(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _wallet = source.readAddress();
    return { $$type: 'BindJettonWallet' as const, queryId: _queryId, wallet: _wallet };
}

export function storeTupleBindJettonWallet(source: BindJettonWallet) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.wallet);
    return builder.build();
}

export function dictValueParserBindJettonWallet(): DictionaryValue<BindJettonWallet> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBindJettonWallet(src)).endCell());
        },
        parse: (src) => {
            return loadBindJettonWallet(src.loadRef().beginParse());
        }
    }
}

export type SetFactoryToken = {
    $$type: 'SetFactoryToken';
    queryId: bigint;
    jetton_wallet: Address;
    dao_fee: bigint;
}

export function storeSetFactoryToken(src: SetFactoryToken) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1024068641, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.jetton_wallet);
        b_0.storeCoins(src.dao_fee);
    };
}

export function loadSetFactoryToken(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1024068641) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _jetton_wallet = sc_0.loadAddress();
    const _dao_fee = sc_0.loadCoins();
    return { $$type: 'SetFactoryToken' as const, queryId: _queryId, jetton_wallet: _jetton_wallet, dao_fee: _dao_fee };
}

export function loadTupleSetFactoryToken(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _jetton_wallet = source.readAddress();
    const _dao_fee = source.readBigNumber();
    return { $$type: 'SetFactoryToken' as const, queryId: _queryId, jetton_wallet: _jetton_wallet, dao_fee: _dao_fee };
}

export function loadGetterTupleSetFactoryToken(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _jetton_wallet = source.readAddress();
    const _dao_fee = source.readBigNumber();
    return { $$type: 'SetFactoryToken' as const, queryId: _queryId, jetton_wallet: _jetton_wallet, dao_fee: _dao_fee };
}

export function storeTupleSetFactoryToken(source: SetFactoryToken) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.jetton_wallet);
    builder.writeNumber(source.dao_fee);
    return builder.build();
}

export function dictValueParserSetFactoryToken(): DictionaryValue<SetFactoryToken> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetFactoryToken(src)).endCell());
        },
        parse: (src) => {
            return loadSetFactoryToken(src.loadRef().beginParse());
        }
    }
}

export type BindChildWallet = {
    $$type: 'BindChildWallet';
    queryId: bigint;
    which: bigint;
    wallet: Address;
}

export function storeBindChildWallet(src: BindChildWallet) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1024068642, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeUint(src.which, 8);
        b_0.storeAddress(src.wallet);
    };
}

export function loadBindChildWallet(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1024068642) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _which = sc_0.loadUintBig(8);
    const _wallet = sc_0.loadAddress();
    return { $$type: 'BindChildWallet' as const, queryId: _queryId, which: _which, wallet: _wallet };
}

export function loadTupleBindChildWallet(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _which = source.readBigNumber();
    const _wallet = source.readAddress();
    return { $$type: 'BindChildWallet' as const, queryId: _queryId, which: _which, wallet: _wallet };
}

export function loadGetterTupleBindChildWallet(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _which = source.readBigNumber();
    const _wallet = source.readAddress();
    return { $$type: 'BindChildWallet' as const, queryId: _queryId, which: _which, wallet: _wallet };
}

export function storeTupleBindChildWallet(source: BindChildWallet) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.which);
    builder.writeAddress(source.wallet);
    return builder.build();
}

export function dictValueParserBindChildWallet(): DictionaryValue<BindChildWallet> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBindChildWallet(src)).endCell());
        },
        parse: (src) => {
            return loadBindChildWallet(src.loadRef().beginParse());
        }
    }
}

export type InitDao = {
    $$type: 'InitDao';
    queryId: bigint;
    voteJettonWallet: Address | null;
    params: Dictionary<bigint, DaoParam>;
}

export function storeInitDao(src: InitDao) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1024068643, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.voteJettonWallet);
        b_0.storeDict(src.params, Dictionary.Keys.BigInt(257), dictValueParserDaoParam());
    };
}

export function loadInitDao(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1024068643) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _voteJettonWallet = sc_0.loadMaybeAddress();
    const _params = Dictionary.load(Dictionary.Keys.BigInt(257), dictValueParserDaoParam(), sc_0);
    return { $$type: 'InitDao' as const, queryId: _queryId, voteJettonWallet: _voteJettonWallet, params: _params };
}

export function loadTupleInitDao(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _voteJettonWallet = source.readAddressOpt();
    const _params = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserDaoParam(), source.readCellOpt());
    return { $$type: 'InitDao' as const, queryId: _queryId, voteJettonWallet: _voteJettonWallet, params: _params };
}

export function loadGetterTupleInitDao(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _voteJettonWallet = source.readAddressOpt();
    const _params = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserDaoParam(), source.readCellOpt());
    return { $$type: 'InitDao' as const, queryId: _queryId, voteJettonWallet: _voteJettonWallet, params: _params };
}

export function storeTupleInitDao(source: InitDao) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.voteJettonWallet);
    builder.writeCell(source.params.size > 0 ? beginCell().storeDictDirect(source.params, Dictionary.Keys.BigInt(257), dictValueParserDaoParam()).endCell() : null);
    return builder.build();
}

export function dictValueParserInitDao(): DictionaryValue<InitDao> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeInitDao(src)).endCell());
        },
        parse: (src) => {
            return loadInitDao(src.loadRef().beginParse());
        }
    }
}

export type RelayCreateVoting = {
    $$type: 'RelayCreateVoting';
    queryId: bigint;
    initiator: Address;
    metadata: Cell;
    settings: VoteSettings;
    action: DaoAction;
}

export function storeRelayCreateVoting(src: RelayCreateVoting) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1024068656, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.initiator);
        b_0.storeRef(src.metadata);
        b_0.store(storeVoteSettings(src.settings));
        const b_1 = new Builder();
        b_1.store(storeDaoAction(src.action));
        b_0.storeRef(b_1.endCell());
    };
}

export function loadRelayCreateVoting(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1024068656) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _initiator = sc_0.loadAddress();
    const _metadata = sc_0.loadRef();
    const _settings = loadVoteSettings(sc_0);
    const sc_1 = sc_0.loadRef().beginParse();
    const _action = loadDaoAction(sc_1);
    return { $$type: 'RelayCreateVoting' as const, queryId: _queryId, initiator: _initiator, metadata: _metadata, settings: _settings, action: _action };
}

export function loadTupleRelayCreateVoting(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _initiator = source.readAddress();
    const _metadata = source.readCell();
    const _settings = loadTupleVoteSettings(source);
    const _action = loadTupleDaoAction(source);
    return { $$type: 'RelayCreateVoting' as const, queryId: _queryId, initiator: _initiator, metadata: _metadata, settings: _settings, action: _action };
}

export function loadGetterTupleRelayCreateVoting(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _initiator = source.readAddress();
    const _metadata = source.readCell();
    const _settings = loadGetterTupleVoteSettings(source);
    const _action = loadGetterTupleDaoAction(source);
    return { $$type: 'RelayCreateVoting' as const, queryId: _queryId, initiator: _initiator, metadata: _metadata, settings: _settings, action: _action };
}

export function storeTupleRelayCreateVoting(source: RelayCreateVoting) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.initiator);
    builder.writeCell(source.metadata);
    builder.writeTuple(storeTupleVoteSettings(source.settings));
    builder.writeTuple(storeTupleDaoAction(source.action));
    return builder.build();
}

export function dictValueParserRelayCreateVoting(): DictionaryValue<RelayCreateVoting> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRelayCreateVoting(src)).endCell());
        },
        parse: (src) => {
            return loadRelayCreateVoting(src.loadRef().beginParse());
        }
    }
}

export type RelayVotingAddOption = {
    $$type: 'RelayVotingAddOption';
    queryId: bigint;
    voting: Address;
    title: string;
    description: string;
}

export function storeRelayVotingAddOption(src: RelayVotingAddOption) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1024068657, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.voting);
        b_0.storeStringRefTail(src.title);
        b_0.storeStringRefTail(src.description);
    };
}

export function loadRelayVotingAddOption(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1024068657) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _voting = sc_0.loadAddress();
    const _title = sc_0.loadStringRefTail();
    const _description = sc_0.loadStringRefTail();
    return { $$type: 'RelayVotingAddOption' as const, queryId: _queryId, voting: _voting, title: _title, description: _description };
}

export function loadTupleRelayVotingAddOption(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _voting = source.readAddress();
    const _title = source.readString();
    const _description = source.readString();
    return { $$type: 'RelayVotingAddOption' as const, queryId: _queryId, voting: _voting, title: _title, description: _description };
}

export function loadGetterTupleRelayVotingAddOption(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _voting = source.readAddress();
    const _title = source.readString();
    const _description = source.readString();
    return { $$type: 'RelayVotingAddOption' as const, queryId: _queryId, voting: _voting, title: _title, description: _description };
}

export function storeTupleRelayVotingAddOption(source: RelayVotingAddOption) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.voting);
    builder.writeString(source.title);
    builder.writeString(source.description);
    return builder.build();
}

export function dictValueParserRelayVotingAddOption(): DictionaryValue<RelayVotingAddOption> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRelayVotingAddOption(src)).endCell());
        },
        parse: (src) => {
            return loadRelayVotingAddOption(src.loadRef().beginParse());
        }
    }
}

export type RelayVotingStart = {
    $$type: 'RelayVotingStart';
    queryId: bigint;
    voting: Address;
}

export function storeRelayVotingStart(src: RelayVotingStart) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1024068658, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.voting);
    };
}

export function loadRelayVotingStart(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1024068658) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _voting = sc_0.loadAddress();
    return { $$type: 'RelayVotingStart' as const, queryId: _queryId, voting: _voting };
}

export function loadTupleRelayVotingStart(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _voting = source.readAddress();
    return { $$type: 'RelayVotingStart' as const, queryId: _queryId, voting: _voting };
}

export function loadGetterTupleRelayVotingStart(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _voting = source.readAddress();
    return { $$type: 'RelayVotingStart' as const, queryId: _queryId, voting: _voting };
}

export function storeTupleRelayVotingStart(source: RelayVotingStart) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.voting);
    return builder.build();
}

export function dictValueParserRelayVotingStart(): DictionaryValue<RelayVotingStart> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRelayVotingStart(src)).endCell());
        },
        parse: (src) => {
            return loadRelayVotingStart(src.loadRef().beginParse());
        }
    }
}

export type RelayWeightCast = {
    $$type: 'RelayWeightCast';
    queryId: bigint;
    voter: Address;
    voting: Address;
    optionAddress: Address;
}

export function storeRelayWeightCast(src: RelayWeightCast) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1024068659, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.voter);
        b_0.storeAddress(src.voting);
        b_0.storeAddress(src.optionAddress);
    };
}

export function loadRelayWeightCast(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1024068659) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _voter = sc_0.loadAddress();
    const _voting = sc_0.loadAddress();
    const _optionAddress = sc_0.loadAddress();
    return { $$type: 'RelayWeightCast' as const, queryId: _queryId, voter: _voter, voting: _voting, optionAddress: _optionAddress };
}

export function loadTupleRelayWeightCast(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _voter = source.readAddress();
    const _voting = source.readAddress();
    const _optionAddress = source.readAddress();
    return { $$type: 'RelayWeightCast' as const, queryId: _queryId, voter: _voter, voting: _voting, optionAddress: _optionAddress };
}

export function loadGetterTupleRelayWeightCast(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _voter = source.readAddress();
    const _voting = source.readAddress();
    const _optionAddress = source.readAddress();
    return { $$type: 'RelayWeightCast' as const, queryId: _queryId, voter: _voter, voting: _voting, optionAddress: _optionAddress };
}

export function storeTupleRelayWeightCast(source: RelayWeightCast) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.voter);
    builder.writeAddress(source.voting);
    builder.writeAddress(source.optionAddress);
    return builder.build();
}

export function dictValueParserRelayWeightCast(): DictionaryValue<RelayWeightCast> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRelayWeightCast(src)).endCell());
        },
        parse: (src) => {
            return loadRelayWeightCast(src.loadRef().beginParse());
        }
    }
}

export type RelayCreateVotingReq = {
    $$type: 'RelayCreateVotingReq';
    queryId: bigint;
    dao: Address;
    initiator: Address;
    metadata: Cell;
    settings: VoteSettings;
    action: DaoAction;
}

export function storeRelayCreateVotingReq(src: RelayCreateVotingReq) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1024068660, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.dao);
        b_0.storeAddress(src.initiator);
        b_0.storeRef(src.metadata);
        const b_1 = new Builder();
        b_1.store(storeVoteSettings(src.settings));
        const b_2 = new Builder();
        b_2.store(storeDaoAction(src.action));
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadRelayCreateVotingReq(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1024068660) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _dao = sc_0.loadAddress();
    const _initiator = sc_0.loadAddress();
    const _metadata = sc_0.loadRef();
    const sc_1 = sc_0.loadRef().beginParse();
    const _settings = loadVoteSettings(sc_1);
    const sc_2 = sc_1.loadRef().beginParse();
    const _action = loadDaoAction(sc_2);
    return { $$type: 'RelayCreateVotingReq' as const, queryId: _queryId, dao: _dao, initiator: _initiator, metadata: _metadata, settings: _settings, action: _action };
}

export function loadTupleRelayCreateVotingReq(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _dao = source.readAddress();
    const _initiator = source.readAddress();
    const _metadata = source.readCell();
    const _settings = loadTupleVoteSettings(source);
    const _action = loadTupleDaoAction(source);
    return { $$type: 'RelayCreateVotingReq' as const, queryId: _queryId, dao: _dao, initiator: _initiator, metadata: _metadata, settings: _settings, action: _action };
}

export function loadGetterTupleRelayCreateVotingReq(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _dao = source.readAddress();
    const _initiator = source.readAddress();
    const _metadata = source.readCell();
    const _settings = loadGetterTupleVoteSettings(source);
    const _action = loadGetterTupleDaoAction(source);
    return { $$type: 'RelayCreateVotingReq' as const, queryId: _queryId, dao: _dao, initiator: _initiator, metadata: _metadata, settings: _settings, action: _action };
}

export function storeTupleRelayCreateVotingReq(source: RelayCreateVotingReq) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.dao);
    builder.writeAddress(source.initiator);
    builder.writeCell(source.metadata);
    builder.writeTuple(storeTupleVoteSettings(source.settings));
    builder.writeTuple(storeTupleDaoAction(source.action));
    return builder.build();
}

export function dictValueParserRelayCreateVotingReq(): DictionaryValue<RelayCreateVotingReq> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRelayCreateVotingReq(src)).endCell());
        },
        parse: (src) => {
            return loadRelayCreateVotingReq(src.loadRef().beginParse());
        }
    }
}

export type RelayVotingAddOptionReq = {
    $$type: 'RelayVotingAddOptionReq';
    queryId: bigint;
    dao: Address;
    voting: Address;
    title: string;
    description: string;
}

export function storeRelayVotingAddOptionReq(src: RelayVotingAddOptionReq) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1024068661, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.dao);
        b_0.storeAddress(src.voting);
        b_0.storeStringRefTail(src.title);
        b_0.storeStringRefTail(src.description);
    };
}

export function loadRelayVotingAddOptionReq(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1024068661) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _dao = sc_0.loadAddress();
    const _voting = sc_0.loadAddress();
    const _title = sc_0.loadStringRefTail();
    const _description = sc_0.loadStringRefTail();
    return { $$type: 'RelayVotingAddOptionReq' as const, queryId: _queryId, dao: _dao, voting: _voting, title: _title, description: _description };
}

export function loadTupleRelayVotingAddOptionReq(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _dao = source.readAddress();
    const _voting = source.readAddress();
    const _title = source.readString();
    const _description = source.readString();
    return { $$type: 'RelayVotingAddOptionReq' as const, queryId: _queryId, dao: _dao, voting: _voting, title: _title, description: _description };
}

export function loadGetterTupleRelayVotingAddOptionReq(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _dao = source.readAddress();
    const _voting = source.readAddress();
    const _title = source.readString();
    const _description = source.readString();
    return { $$type: 'RelayVotingAddOptionReq' as const, queryId: _queryId, dao: _dao, voting: _voting, title: _title, description: _description };
}

export function storeTupleRelayVotingAddOptionReq(source: RelayVotingAddOptionReq) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.dao);
    builder.writeAddress(source.voting);
    builder.writeString(source.title);
    builder.writeString(source.description);
    return builder.build();
}

export function dictValueParserRelayVotingAddOptionReq(): DictionaryValue<RelayVotingAddOptionReq> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRelayVotingAddOptionReq(src)).endCell());
        },
        parse: (src) => {
            return loadRelayVotingAddOptionReq(src.loadRef().beginParse());
        }
    }
}

export type RelayVotingStartReq = {
    $$type: 'RelayVotingStartReq';
    queryId: bigint;
    dao: Address;
    voting: Address;
}

export function storeRelayVotingStartReq(src: RelayVotingStartReq) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1024068662, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.dao);
        b_0.storeAddress(src.voting);
    };
}

export function loadRelayVotingStartReq(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1024068662) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _dao = sc_0.loadAddress();
    const _voting = sc_0.loadAddress();
    return { $$type: 'RelayVotingStartReq' as const, queryId: _queryId, dao: _dao, voting: _voting };
}

export function loadTupleRelayVotingStartReq(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _dao = source.readAddress();
    const _voting = source.readAddress();
    return { $$type: 'RelayVotingStartReq' as const, queryId: _queryId, dao: _dao, voting: _voting };
}

export function loadGetterTupleRelayVotingStartReq(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _dao = source.readAddress();
    const _voting = source.readAddress();
    return { $$type: 'RelayVotingStartReq' as const, queryId: _queryId, dao: _dao, voting: _voting };
}

export function storeTupleRelayVotingStartReq(source: RelayVotingStartReq) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.dao);
    builder.writeAddress(source.voting);
    return builder.build();
}

export function dictValueParserRelayVotingStartReq(): DictionaryValue<RelayVotingStartReq> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRelayVotingStartReq(src)).endCell());
        },
        parse: (src) => {
            return loadRelayVotingStartReq(src.loadRef().beginParse());
        }
    }
}

export type RelayWeightCastReq = {
    $$type: 'RelayWeightCastReq';
    queryId: bigint;
    dao: Address;
    voter: Address;
    voting: Address;
    optionAddress: Address;
}

export function storeRelayWeightCastReq(src: RelayWeightCastReq) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1024068663, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.dao);
        b_0.storeAddress(src.voter);
        b_0.storeAddress(src.voting);
        const b_1 = new Builder();
        b_1.storeAddress(src.optionAddress);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadRelayWeightCastReq(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1024068663) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _dao = sc_0.loadAddress();
    const _voter = sc_0.loadAddress();
    const _voting = sc_0.loadAddress();
    const sc_1 = sc_0.loadRef().beginParse();
    const _optionAddress = sc_1.loadAddress();
    return { $$type: 'RelayWeightCastReq' as const, queryId: _queryId, dao: _dao, voter: _voter, voting: _voting, optionAddress: _optionAddress };
}

export function loadTupleRelayWeightCastReq(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _dao = source.readAddress();
    const _voter = source.readAddress();
    const _voting = source.readAddress();
    const _optionAddress = source.readAddress();
    return { $$type: 'RelayWeightCastReq' as const, queryId: _queryId, dao: _dao, voter: _voter, voting: _voting, optionAddress: _optionAddress };
}

export function loadGetterTupleRelayWeightCastReq(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _dao = source.readAddress();
    const _voter = source.readAddress();
    const _voting = source.readAddress();
    const _optionAddress = source.readAddress();
    return { $$type: 'RelayWeightCastReq' as const, queryId: _queryId, dao: _dao, voter: _voter, voting: _voting, optionAddress: _optionAddress };
}

export function storeTupleRelayWeightCastReq(source: RelayWeightCastReq) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.dao);
    builder.writeAddress(source.voter);
    builder.writeAddress(source.voting);
    builder.writeAddress(source.optionAddress);
    return builder.build();
}

export function dictValueParserRelayWeightCastReq(): DictionaryValue<RelayWeightCastReq> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRelayWeightCastReq(src)).endCell());
        },
        parse: (src) => {
            return loadRelayWeightCastReq(src.loadRef().beginParse());
        }
    }
}

export type RegisterVoting = {
    $$type: 'RegisterVoting';
    queryId: bigint;
    voting: Address;
}

export function storeRegisterVoting(src: RegisterVoting) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1024068644, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.voting);
    };
}

export function loadRegisterVoting(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1024068644) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _voting = sc_0.loadAddress();
    return { $$type: 'RegisterVoting' as const, queryId: _queryId, voting: _voting };
}

export function loadTupleRegisterVoting(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _voting = source.readAddress();
    return { $$type: 'RegisterVoting' as const, queryId: _queryId, voting: _voting };
}

export function loadGetterTupleRegisterVoting(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _voting = source.readAddress();
    return { $$type: 'RegisterVoting' as const, queryId: _queryId, voting: _voting };
}

export function storeTupleRegisterVoting(source: RegisterVoting) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.voting);
    return builder.build();
}

export function dictValueParserRegisterVoting(): DictionaryValue<RegisterVoting> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRegisterVoting(src)).endCell());
        },
        parse: (src) => {
            return loadRegisterVoting(src.loadRef().beginParse());
        }
    }
}

export type VotingStarted = {
    $$type: 'VotingStarted';
    queryId: bigint;
    endTime: bigint;
}

export function storeVotingStarted(src: VotingStarted) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1024068645, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeUint(src.endTime, 64);
    };
}

export function loadVotingStarted(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1024068645) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _endTime = sc_0.loadUintBig(64);
    return { $$type: 'VotingStarted' as const, queryId: _queryId, endTime: _endTime };
}

export function loadTupleVotingStarted(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _endTime = source.readBigNumber();
    return { $$type: 'VotingStarted' as const, queryId: _queryId, endTime: _endTime };
}

export function loadGetterTupleVotingStarted(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _endTime = source.readBigNumber();
    return { $$type: 'VotingStarted' as const, queryId: _queryId, endTime: _endTime };
}

export function storeTupleVotingStarted(source: VotingStarted) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.endTime);
    return builder.build();
}

export function dictValueParserVotingStarted(): DictionaryValue<VotingStarted> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVotingStarted(src)).endCell());
        },
        parse: (src) => {
            return loadVotingStarted(src.loadRef().beginParse());
        }
    }
}

export type AddWeight = {
    $$type: 'AddWeight';
    voter: Address;
    optionAddress: Address;
    weight: bigint;
}

export function storeAddWeight(src: AddWeight) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1024068624, 32);
        b_0.storeAddress(src.voter);
        b_0.storeAddress(src.optionAddress);
        b_0.storeCoins(src.weight);
    };
}

export function loadAddWeight(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1024068624) { throw Error('Invalid prefix'); }
    const _voter = sc_0.loadAddress();
    const _optionAddress = sc_0.loadAddress();
    const _weight = sc_0.loadCoins();
    return { $$type: 'AddWeight' as const, voter: _voter, optionAddress: _optionAddress, weight: _weight };
}

export function loadTupleAddWeight(source: TupleReader) {
    const _voter = source.readAddress();
    const _optionAddress = source.readAddress();
    const _weight = source.readBigNumber();
    return { $$type: 'AddWeight' as const, voter: _voter, optionAddress: _optionAddress, weight: _weight };
}

export function loadGetterTupleAddWeight(source: TupleReader) {
    const _voter = source.readAddress();
    const _optionAddress = source.readAddress();
    const _weight = source.readBigNumber();
    return { $$type: 'AddWeight' as const, voter: _voter, optionAddress: _optionAddress, weight: _weight };
}

export function storeTupleAddWeight(source: AddWeight) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.voter);
    builder.writeAddress(source.optionAddress);
    builder.writeNumber(source.weight);
    return builder.build();
}

export function dictValueParserAddWeight(): DictionaryValue<AddWeight> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeAddWeight(src)).endCell());
        },
        parse: (src) => {
            return loadAddWeight(src.loadRef().beginParse());
        }
    }
}

export type TokenInfo = {
    $$type: 'TokenInfo';
    jetton_master: Address;
    jetton_fee: bigint;
    amount: bigint;
    admin: Address;
}

export function storeTokenInfo(src: TokenInfo) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.jetton_master);
        b_0.storeCoins(src.jetton_fee);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.admin);
    };
}

export function loadTokenInfo(slice: Slice) {
    const sc_0 = slice;
    const _jetton_master = sc_0.loadAddress();
    const _jetton_fee = sc_0.loadCoins();
    const _amount = sc_0.loadCoins();
    const _admin = sc_0.loadAddress();
    return { $$type: 'TokenInfo' as const, jetton_master: _jetton_master, jetton_fee: _jetton_fee, amount: _amount, admin: _admin };
}

export function loadTupleTokenInfo(source: TupleReader) {
    const _jetton_master = source.readAddress();
    const _jetton_fee = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _admin = source.readAddress();
    return { $$type: 'TokenInfo' as const, jetton_master: _jetton_master, jetton_fee: _jetton_fee, amount: _amount, admin: _admin };
}

export function loadGetterTupleTokenInfo(source: TupleReader) {
    const _jetton_master = source.readAddress();
    const _jetton_fee = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _admin = source.readAddress();
    return { $$type: 'TokenInfo' as const, jetton_master: _jetton_master, jetton_fee: _jetton_fee, amount: _amount, admin: _admin };
}

export function storeTupleTokenInfo(source: TokenInfo) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.jetton_master);
    builder.writeNumber(source.jetton_fee);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.admin);
    return builder.build();
}

export function dictValueParserTokenInfo(): DictionaryValue<TokenInfo> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTokenInfo(src)).endCell());
        },
        parse: (src) => {
            return loadTokenInfo(src.loadRef().beginParse());
        }
    }
}

export type DaoToken = {
    $$type: 'DaoToken';
    jetton_wallet: Address;
    dao_fee: bigint;
}

export function storeDaoToken(src: DaoToken) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.jetton_wallet);
        b_0.storeCoins(src.dao_fee);
    };
}

export function loadDaoToken(slice: Slice) {
    const sc_0 = slice;
    const _jetton_wallet = sc_0.loadAddress();
    const _dao_fee = sc_0.loadCoins();
    return { $$type: 'DaoToken' as const, jetton_wallet: _jetton_wallet, dao_fee: _dao_fee };
}

export function loadTupleDaoToken(source: TupleReader) {
    const _jetton_wallet = source.readAddress();
    const _dao_fee = source.readBigNumber();
    return { $$type: 'DaoToken' as const, jetton_wallet: _jetton_wallet, dao_fee: _dao_fee };
}

export function loadGetterTupleDaoToken(source: TupleReader) {
    const _jetton_wallet = source.readAddress();
    const _dao_fee = source.readBigNumber();
    return { $$type: 'DaoToken' as const, jetton_wallet: _jetton_wallet, dao_fee: _dao_fee };
}

export function storeTupleDaoToken(source: DaoToken) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.jetton_wallet);
    builder.writeNumber(source.dao_fee);
    return builder.build();
}

export function dictValueParserDaoToken(): DictionaryValue<DaoToken> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDaoToken(src)).endCell());
        },
        parse: (src) => {
            return loadDaoToken(src.loadRef().beginParse());
        }
    }
}

export type OptionInfo = {
    $$type: 'OptionInfo';
    title: string;
    description: string;
}

export function storeOptionInfo(src: OptionInfo) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeStringRefTail(src.title);
        b_0.storeStringRefTail(src.description);
    };
}

export function loadOptionInfo(slice: Slice) {
    const sc_0 = slice;
    const _title = sc_0.loadStringRefTail();
    const _description = sc_0.loadStringRefTail();
    return { $$type: 'OptionInfo' as const, title: _title, description: _description };
}

export function loadTupleOptionInfo(source: TupleReader) {
    const _title = source.readString();
    const _description = source.readString();
    return { $$type: 'OptionInfo' as const, title: _title, description: _description };
}

export function loadGetterTupleOptionInfo(source: TupleReader) {
    const _title = source.readString();
    const _description = source.readString();
    return { $$type: 'OptionInfo' as const, title: _title, description: _description };
}

export function storeTupleOptionInfo(source: OptionInfo) {
    const builder = new TupleBuilder();
    builder.writeString(source.title);
    builder.writeString(source.description);
    return builder.build();
}

export function dictValueParserOptionInfo(): DictionaryValue<OptionInfo> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeOptionInfo(src)).endCell());
        },
        parse: (src) => {
            return loadOptionInfo(src.loadRef().beginParse());
        }
    }
}

export type OptionInfoRoot = {
    $$type: 'OptionInfoRoot';
    address: Address;
    title: string;
    description: string;
    amount: bigint;
}

export function storeOptionInfoRoot(src: OptionInfoRoot) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.address);
        b_0.storeStringRefTail(src.title);
        b_0.storeStringRefTail(src.description);
        b_0.storeUint(src.amount, 64);
    };
}

export function loadOptionInfoRoot(slice: Slice) {
    const sc_0 = slice;
    const _address = sc_0.loadAddress();
    const _title = sc_0.loadStringRefTail();
    const _description = sc_0.loadStringRefTail();
    const _amount = sc_0.loadUintBig(64);
    return { $$type: 'OptionInfoRoot' as const, address: _address, title: _title, description: _description, amount: _amount };
}

export function loadTupleOptionInfoRoot(source: TupleReader) {
    const _address = source.readAddress();
    const _title = source.readString();
    const _description = source.readString();
    const _amount = source.readBigNumber();
    return { $$type: 'OptionInfoRoot' as const, address: _address, title: _title, description: _description, amount: _amount };
}

export function loadGetterTupleOptionInfoRoot(source: TupleReader) {
    const _address = source.readAddress();
    const _title = source.readString();
    const _description = source.readString();
    const _amount = source.readBigNumber();
    return { $$type: 'OptionInfoRoot' as const, address: _address, title: _title, description: _description, amount: _amount };
}

export function storeTupleOptionInfoRoot(source: OptionInfoRoot) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.address);
    builder.writeString(source.title);
    builder.writeString(source.description);
    builder.writeNumber(source.amount);
    return builder.build();
}

export function dictValueParserOptionInfoRoot(): DictionaryValue<OptionInfoRoot> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeOptionInfoRoot(src)).endCell());
        },
        parse: (src) => {
            return loadOptionInfoRoot(src.loadRef().beginParse());
        }
    }
}

export type VoteSettings = {
    $$type: 'VoteSettings';
    endTime: bigint;
    min_amount: bigint;
    quorum: bigint;
    supportPct: bigint;
    turnoutPct: bigint;
    totalSupply: bigint;
}

export function storeVoteSettings(src: VoteSettings) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(src.endTime, 64);
        b_0.storeCoins(src.min_amount);
        b_0.storeCoins(src.quorum);
        b_0.storeUint(src.supportPct, 8);
        b_0.storeUint(src.turnoutPct, 8);
        b_0.storeCoins(src.totalSupply);
    };
}

export function loadVoteSettings(slice: Slice) {
    const sc_0 = slice;
    const _endTime = sc_0.loadUintBig(64);
    const _min_amount = sc_0.loadCoins();
    const _quorum = sc_0.loadCoins();
    const _supportPct = sc_0.loadUintBig(8);
    const _turnoutPct = sc_0.loadUintBig(8);
    const _totalSupply = sc_0.loadCoins();
    return { $$type: 'VoteSettings' as const, endTime: _endTime, min_amount: _min_amount, quorum: _quorum, supportPct: _supportPct, turnoutPct: _turnoutPct, totalSupply: _totalSupply };
}

export function loadTupleVoteSettings(source: TupleReader) {
    const _endTime = source.readBigNumber();
    const _min_amount = source.readBigNumber();
    const _quorum = source.readBigNumber();
    const _supportPct = source.readBigNumber();
    const _turnoutPct = source.readBigNumber();
    const _totalSupply = source.readBigNumber();
    return { $$type: 'VoteSettings' as const, endTime: _endTime, min_amount: _min_amount, quorum: _quorum, supportPct: _supportPct, turnoutPct: _turnoutPct, totalSupply: _totalSupply };
}

export function loadGetterTupleVoteSettings(source: TupleReader) {
    const _endTime = source.readBigNumber();
    const _min_amount = source.readBigNumber();
    const _quorum = source.readBigNumber();
    const _supportPct = source.readBigNumber();
    const _turnoutPct = source.readBigNumber();
    const _totalSupply = source.readBigNumber();
    return { $$type: 'VoteSettings' as const, endTime: _endTime, min_amount: _min_amount, quorum: _quorum, supportPct: _supportPct, turnoutPct: _turnoutPct, totalSupply: _totalSupply };
}

export function storeTupleVoteSettings(source: VoteSettings) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.endTime);
    builder.writeNumber(source.min_amount);
    builder.writeNumber(source.quorum);
    builder.writeNumber(source.supportPct);
    builder.writeNumber(source.turnoutPct);
    builder.writeNumber(source.totalSupply);
    return builder.build();
}

export function dictValueParserVoteSettings(): DictionaryValue<VoteSettings> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVoteSettings(src)).endCell());
        },
        parse: (src) => {
            return loadVoteSettings(src.loadRef().beginParse());
        }
    }
}

export type StartNewVotingStruct = {
    $$type: 'StartNewVotingStruct';
    metadata: Cell;
    settings: VoteSettings;
}

export function storeStartNewVotingStruct(src: StartNewVotingStruct) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeRef(src.metadata);
        b_0.store(storeVoteSettings(src.settings));
    };
}

export function loadStartNewVotingStruct(slice: Slice) {
    const sc_0 = slice;
    const _metadata = sc_0.loadRef();
    const _settings = loadVoteSettings(sc_0);
    return { $$type: 'StartNewVotingStruct' as const, metadata: _metadata, settings: _settings };
}

export function loadTupleStartNewVotingStruct(source: TupleReader) {
    const _metadata = source.readCell();
    const _settings = loadTupleVoteSettings(source);
    return { $$type: 'StartNewVotingStruct' as const, metadata: _metadata, settings: _settings };
}

export function loadGetterTupleStartNewVotingStruct(source: TupleReader) {
    const _metadata = source.readCell();
    const _settings = loadGetterTupleVoteSettings(source);
    return { $$type: 'StartNewVotingStruct' as const, metadata: _metadata, settings: _settings };
}

export function storeTupleStartNewVotingStruct(source: StartNewVotingStruct) {
    const builder = new TupleBuilder();
    builder.writeCell(source.metadata);
    builder.writeTuple(storeTupleVoteSettings(source.settings));
    return builder.build();
}

export function dictValueParserStartNewVotingStruct(): DictionaryValue<StartNewVotingStruct> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStartNewVotingStruct(src)).endCell());
        },
        parse: (src) => {
            return loadStartNewVotingStruct(src.loadRef().beginParse());
        }
    }
}

export type StartNewVotingTestStruct = {
    $$type: 'StartNewVotingTestStruct';
    endTime: bigint;
    min_amount: bigint;
    fee: bigint;
}

export function storeStartNewVotingTestStruct(src: StartNewVotingTestStruct) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(src.endTime, 64);
        b_0.storeCoins(src.min_amount);
        b_0.storeCoins(src.fee);
    };
}

export function loadStartNewVotingTestStruct(slice: Slice) {
    const sc_0 = slice;
    const _endTime = sc_0.loadUintBig(64);
    const _min_amount = sc_0.loadCoins();
    const _fee = sc_0.loadCoins();
    return { $$type: 'StartNewVotingTestStruct' as const, endTime: _endTime, min_amount: _min_amount, fee: _fee };
}

export function loadTupleStartNewVotingTestStruct(source: TupleReader) {
    const _endTime = source.readBigNumber();
    const _min_amount = source.readBigNumber();
    const _fee = source.readBigNumber();
    return { $$type: 'StartNewVotingTestStruct' as const, endTime: _endTime, min_amount: _min_amount, fee: _fee };
}

export function loadGetterTupleStartNewVotingTestStruct(source: TupleReader) {
    const _endTime = source.readBigNumber();
    const _min_amount = source.readBigNumber();
    const _fee = source.readBigNumber();
    return { $$type: 'StartNewVotingTestStruct' as const, endTime: _endTime, min_amount: _min_amount, fee: _fee };
}

export function storeTupleStartNewVotingTestStruct(source: StartNewVotingTestStruct) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.endTime);
    builder.writeNumber(source.min_amount);
    builder.writeNumber(source.fee);
    return builder.build();
}

export function dictValueParserStartNewVotingTestStruct(): DictionaryValue<StartNewVotingTestStruct> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStartNewVotingTestStruct(src)).endCell());
        },
        parse: (src) => {
            return loadStartNewVotingTestStruct(src.loadRef().beginParse());
        }
    }
}

export type TakeDAOVoteStruct = {
    $$type: 'TakeDAOVoteStruct';
    adminAddress: Address;
    optionAddress: Address;
}

export function storeTakeDAOVoteStruct(src: TakeDAOVoteStruct) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.adminAddress);
        b_0.storeAddress(src.optionAddress);
    };
}

export function loadTakeDAOVoteStruct(slice: Slice) {
    const sc_0 = slice;
    const _adminAddress = sc_0.loadAddress();
    const _optionAddress = sc_0.loadAddress();
    return { $$type: 'TakeDAOVoteStruct' as const, adminAddress: _adminAddress, optionAddress: _optionAddress };
}

export function loadTupleTakeDAOVoteStruct(source: TupleReader) {
    const _adminAddress = source.readAddress();
    const _optionAddress = source.readAddress();
    return { $$type: 'TakeDAOVoteStruct' as const, adminAddress: _adminAddress, optionAddress: _optionAddress };
}

export function loadGetterTupleTakeDAOVoteStruct(source: TupleReader) {
    const _adminAddress = source.readAddress();
    const _optionAddress = source.readAddress();
    return { $$type: 'TakeDAOVoteStruct' as const, adminAddress: _adminAddress, optionAddress: _optionAddress };
}

export function storeTupleTakeDAOVoteStruct(source: TakeDAOVoteStruct) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.adminAddress);
    builder.writeAddress(source.optionAddress);
    return builder.build();
}

export function dictValueParserTakeDAOVoteStruct(): DictionaryValue<TakeDAOVoteStruct> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTakeDAOVoteStruct(src)).endCell());
        },
        parse: (src) => {
            return loadTakeDAOVoteStruct(src.loadRef().beginParse());
        }
    }
}

export type WinnerInfo = {
    $$type: 'WinnerInfo';
    address: Address | null;
    amount: bigint;
    total: bigint;
    finished: boolean;
}

export function storeWinnerInfo(src: WinnerInfo) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.address);
        b_0.storeUint(src.amount, 64);
        b_0.storeUint(src.total, 64);
        b_0.storeBit(src.finished);
    };
}

export function loadWinnerInfo(slice: Slice) {
    const sc_0 = slice;
    const _address = sc_0.loadMaybeAddress();
    const _amount = sc_0.loadUintBig(64);
    const _total = sc_0.loadUintBig(64);
    const _finished = sc_0.loadBit();
    return { $$type: 'WinnerInfo' as const, address: _address, amount: _amount, total: _total, finished: _finished };
}

export function loadTupleWinnerInfo(source: TupleReader) {
    const _address = source.readAddressOpt();
    const _amount = source.readBigNumber();
    const _total = source.readBigNumber();
    const _finished = source.readBoolean();
    return { $$type: 'WinnerInfo' as const, address: _address, amount: _amount, total: _total, finished: _finished };
}

export function loadGetterTupleWinnerInfo(source: TupleReader) {
    const _address = source.readAddressOpt();
    const _amount = source.readBigNumber();
    const _total = source.readBigNumber();
    const _finished = source.readBoolean();
    return { $$type: 'WinnerInfo' as const, address: _address, amount: _amount, total: _total, finished: _finished };
}

export function storeTupleWinnerInfo(source: WinnerInfo) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.address);
    builder.writeNumber(source.amount);
    builder.writeNumber(source.total);
    builder.writeBoolean(source.finished);
    return builder.build();
}

export function dictValueParserWinnerInfo(): DictionaryValue<WinnerInfo> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeWinnerInfo(src)).endCell());
        },
        parse: (src) => {
            return loadWinnerInfo(src.loadRef().beginParse());
        }
    }
}

export type DaoConfig = {
    $$type: 'DaoConfig';
    voteJettonMaster: Address;
    minProposal: bigint;
    minQuorum: bigint;
    minSupportPct: bigint;
    minTurnoutPct: bigint;
    minDuration: bigint;
    logo: Cell;
    voteJettonWallet: Address | null;
}

export function storeDaoConfig(src: DaoConfig) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.voteJettonMaster);
        b_0.storeCoins(src.minProposal);
        b_0.storeCoins(src.minQuorum);
        b_0.storeUint(src.minSupportPct, 8);
        b_0.storeUint(src.minTurnoutPct, 8);
        b_0.storeUint(src.minDuration, 32);
        b_0.storeRef(src.logo);
        b_0.storeAddress(src.voteJettonWallet);
    };
}

export function loadDaoConfig(slice: Slice) {
    const sc_0 = slice;
    const _voteJettonMaster = sc_0.loadAddress();
    const _minProposal = sc_0.loadCoins();
    const _minQuorum = sc_0.loadCoins();
    const _minSupportPct = sc_0.loadUintBig(8);
    const _minTurnoutPct = sc_0.loadUintBig(8);
    const _minDuration = sc_0.loadUintBig(32);
    const _logo = sc_0.loadRef();
    const _voteJettonWallet = sc_0.loadMaybeAddress();
    return { $$type: 'DaoConfig' as const, voteJettonMaster: _voteJettonMaster, minProposal: _minProposal, minQuorum: _minQuorum, minSupportPct: _minSupportPct, minTurnoutPct: _minTurnoutPct, minDuration: _minDuration, logo: _logo, voteJettonWallet: _voteJettonWallet };
}

export function loadTupleDaoConfig(source: TupleReader) {
    const _voteJettonMaster = source.readAddress();
    const _minProposal = source.readBigNumber();
    const _minQuorum = source.readBigNumber();
    const _minSupportPct = source.readBigNumber();
    const _minTurnoutPct = source.readBigNumber();
    const _minDuration = source.readBigNumber();
    const _logo = source.readCell();
    const _voteJettonWallet = source.readAddressOpt();
    return { $$type: 'DaoConfig' as const, voteJettonMaster: _voteJettonMaster, minProposal: _minProposal, minQuorum: _minQuorum, minSupportPct: _minSupportPct, minTurnoutPct: _minTurnoutPct, minDuration: _minDuration, logo: _logo, voteJettonWallet: _voteJettonWallet };
}

export function loadGetterTupleDaoConfig(source: TupleReader) {
    const _voteJettonMaster = source.readAddress();
    const _minProposal = source.readBigNumber();
    const _minQuorum = source.readBigNumber();
    const _minSupportPct = source.readBigNumber();
    const _minTurnoutPct = source.readBigNumber();
    const _minDuration = source.readBigNumber();
    const _logo = source.readCell();
    const _voteJettonWallet = source.readAddressOpt();
    return { $$type: 'DaoConfig' as const, voteJettonMaster: _voteJettonMaster, minProposal: _minProposal, minQuorum: _minQuorum, minSupportPct: _minSupportPct, minTurnoutPct: _minTurnoutPct, minDuration: _minDuration, logo: _logo, voteJettonWallet: _voteJettonWallet };
}

export function storeTupleDaoConfig(source: DaoConfig) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.voteJettonMaster);
    builder.writeNumber(source.minProposal);
    builder.writeNumber(source.minQuorum);
    builder.writeNumber(source.minSupportPct);
    builder.writeNumber(source.minTurnoutPct);
    builder.writeNumber(source.minDuration);
    builder.writeCell(source.logo);
    builder.writeAddress(source.voteJettonWallet);
    return builder.build();
}

export function dictValueParserDaoConfig(): DictionaryValue<DaoConfig> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDaoConfig(src)).endCell());
        },
        parse: (src) => {
            return loadDaoConfig(src.loadRef().beginParse());
        }
    }
}

export type DaoParam = {
    $$type: 'DaoParam';
    key: string;
    isString: boolean;
    num: bigint;
    str: string;
}

export function storeDaoParam(src: DaoParam) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeStringRefTail(src.key);
        b_0.storeBit(src.isString);
        b_0.storeInt(src.num, 257);
        b_0.storeStringRefTail(src.str);
    };
}

export function loadDaoParam(slice: Slice) {
    const sc_0 = slice;
    const _key = sc_0.loadStringRefTail();
    const _isString = sc_0.loadBit();
    const _num = sc_0.loadIntBig(257);
    const _str = sc_0.loadStringRefTail();
    return { $$type: 'DaoParam' as const, key: _key, isString: _isString, num: _num, str: _str };
}

export function loadTupleDaoParam(source: TupleReader) {
    const _key = source.readString();
    const _isString = source.readBoolean();
    const _num = source.readBigNumber();
    const _str = source.readString();
    return { $$type: 'DaoParam' as const, key: _key, isString: _isString, num: _num, str: _str };
}

export function loadGetterTupleDaoParam(source: TupleReader) {
    const _key = source.readString();
    const _isString = source.readBoolean();
    const _num = source.readBigNumber();
    const _str = source.readString();
    return { $$type: 'DaoParam' as const, key: _key, isString: _isString, num: _num, str: _str };
}

export function storeTupleDaoParam(source: DaoParam) {
    const builder = new TupleBuilder();
    builder.writeString(source.key);
    builder.writeBoolean(source.isString);
    builder.writeNumber(source.num);
    builder.writeString(source.str);
    return builder.build();
}

export function dictValueParserDaoParam(): DictionaryValue<DaoParam> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDaoParam(src)).endCell());
        },
        parse: (src) => {
            return loadDaoParam(src.loadRef().beginParse());
        }
    }
}

export type DaoAction = {
    $$type: 'DaoAction';
    kind: bigint;
    treasuryWallet: Address | null;
    amount: bigint;
    destination: Address | null;
    newConfig: DaoConfig | null;
    approveOption: Address | null;
    newCode: Cell | null;
    param: DaoParam | null;
}

export function storeDaoAction(src: DaoAction) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(src.kind, 8);
        b_0.storeAddress(src.treasuryWallet);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.destination);
        const b_1 = new Builder();
        if (src.newConfig !== null && src.newConfig !== undefined) { b_1.storeBit(true); b_1.store(storeDaoConfig(src.newConfig)); } else { b_1.storeBit(false); }
        const b_2 = new Builder();
        b_2.storeAddress(src.approveOption);
        if (src.newCode !== null && src.newCode !== undefined) { b_2.storeBit(true).storeRef(src.newCode); } else { b_2.storeBit(false); }
        if (src.param !== null && src.param !== undefined) { b_2.storeBit(true); b_2.store(storeDaoParam(src.param)); } else { b_2.storeBit(false); }
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadDaoAction(slice: Slice) {
    const sc_0 = slice;
    const _kind = sc_0.loadUintBig(8);
    const _treasuryWallet = sc_0.loadMaybeAddress();
    const _amount = sc_0.loadCoins();
    const _destination = sc_0.loadMaybeAddress();
    const sc_1 = sc_0.loadRef().beginParse();
    const _newConfig = sc_1.loadBit() ? loadDaoConfig(sc_1) : null;
    const sc_2 = sc_1.loadRef().beginParse();
    const _approveOption = sc_2.loadMaybeAddress();
    const _newCode = sc_2.loadBit() ? sc_2.loadRef() : null;
    const _param = sc_2.loadBit() ? loadDaoParam(sc_2) : null;
    return { $$type: 'DaoAction' as const, kind: _kind, treasuryWallet: _treasuryWallet, amount: _amount, destination: _destination, newConfig: _newConfig, approveOption: _approveOption, newCode: _newCode, param: _param };
}

export function loadTupleDaoAction(source: TupleReader) {
    const _kind = source.readBigNumber();
    const _treasuryWallet = source.readAddressOpt();
    const _amount = source.readBigNumber();
    const _destination = source.readAddressOpt();
    const _newConfig_p = source.readTupleOpt();
    const _newConfig = _newConfig_p ? loadTupleDaoConfig(_newConfig_p) : null;
    const _approveOption = source.readAddressOpt();
    const _newCode = source.readCellOpt();
    const _param_p = source.readTupleOpt();
    const _param = _param_p ? loadTupleDaoParam(_param_p) : null;
    return { $$type: 'DaoAction' as const, kind: _kind, treasuryWallet: _treasuryWallet, amount: _amount, destination: _destination, newConfig: _newConfig, approveOption: _approveOption, newCode: _newCode, param: _param };
}

export function loadGetterTupleDaoAction(source: TupleReader) {
    const _kind = source.readBigNumber();
    const _treasuryWallet = source.readAddressOpt();
    const _amount = source.readBigNumber();
    const _destination = source.readAddressOpt();
    const _newConfig_p = source.readTupleOpt();
    const _newConfig = _newConfig_p ? loadTupleDaoConfig(_newConfig_p) : null;
    const _approveOption = source.readAddressOpt();
    const _newCode = source.readCellOpt();
    const _param_p = source.readTupleOpt();
    const _param = _param_p ? loadTupleDaoParam(_param_p) : null;
    return { $$type: 'DaoAction' as const, kind: _kind, treasuryWallet: _treasuryWallet, amount: _amount, destination: _destination, newConfig: _newConfig, approveOption: _approveOption, newCode: _newCode, param: _param };
}

export function storeTupleDaoAction(source: DaoAction) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.kind);
    builder.writeAddress(source.treasuryWallet);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.destination);
    if (source.newConfig !== null && source.newConfig !== undefined) {
        builder.writeTuple(storeTupleDaoConfig(source.newConfig));
    } else {
        builder.writeTuple(null);
    }
    builder.writeAddress(source.approveOption);
    builder.writeCell(source.newCode);
    if (source.param !== null && source.param !== undefined) {
        builder.writeTuple(storeTupleDaoParam(source.param));
    } else {
        builder.writeTuple(null);
    }
    return builder.build();
}

export function dictValueParserDaoAction(): DictionaryValue<DaoAction> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDaoAction(src)).endCell());
        },
        parse: (src) => {
            return loadDaoAction(src.loadRef().beginParse());
        }
    }
}

export type SliceBitsAndRefs = {
    $$type: 'SliceBitsAndRefs';
    bits: bigint;
    refs: bigint;
}

export function storeSliceBitsAndRefs(src: SliceBitsAndRefs) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.bits, 257);
        b_0.storeInt(src.refs, 257);
    };
}

export function loadSliceBitsAndRefs(slice: Slice) {
    const sc_0 = slice;
    const _bits = sc_0.loadIntBig(257);
    const _refs = sc_0.loadIntBig(257);
    return { $$type: 'SliceBitsAndRefs' as const, bits: _bits, refs: _refs };
}

export function loadTupleSliceBitsAndRefs(source: TupleReader) {
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'SliceBitsAndRefs' as const, bits: _bits, refs: _refs };
}

export function loadGetterTupleSliceBitsAndRefs(source: TupleReader) {
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'SliceBitsAndRefs' as const, bits: _bits, refs: _refs };
}

export function storeTupleSliceBitsAndRefs(source: SliceBitsAndRefs) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.bits);
    builder.writeNumber(source.refs);
    return builder.build();
}

export function dictValueParserSliceBitsAndRefs(): DictionaryValue<SliceBitsAndRefs> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSliceBitsAndRefs(src)).endCell());
        },
        parse: (src) => {
            return loadSliceBitsAndRefs(src.loadRef().beginParse());
        }
    }
}

export type JettonMinterState = {
    $$type: 'JettonMinterState';
    totalSupply: bigint;
    mintable: boolean;
    adminAddress: Address;
    jettonContent: Cell;
    jettonWalletCode: Cell;
}

export function storeJettonMinterState(src: JettonMinterState) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeCoins(src.totalSupply);
        b_0.storeBit(src.mintable);
        b_0.storeAddress(src.adminAddress);
        b_0.storeRef(src.jettonContent);
        b_0.storeRef(src.jettonWalletCode);
    };
}

export function loadJettonMinterState(slice: Slice) {
    const sc_0 = slice;
    const _totalSupply = sc_0.loadCoins();
    const _mintable = sc_0.loadBit();
    const _adminAddress = sc_0.loadAddress();
    const _jettonContent = sc_0.loadRef();
    const _jettonWalletCode = sc_0.loadRef();
    return { $$type: 'JettonMinterState' as const, totalSupply: _totalSupply, mintable: _mintable, adminAddress: _adminAddress, jettonContent: _jettonContent, jettonWalletCode: _jettonWalletCode };
}

export function loadTupleJettonMinterState(source: TupleReader) {
    const _totalSupply = source.readBigNumber();
    const _mintable = source.readBoolean();
    const _adminAddress = source.readAddress();
    const _jettonContent = source.readCell();
    const _jettonWalletCode = source.readCell();
    return { $$type: 'JettonMinterState' as const, totalSupply: _totalSupply, mintable: _mintable, adminAddress: _adminAddress, jettonContent: _jettonContent, jettonWalletCode: _jettonWalletCode };
}

export function loadGetterTupleJettonMinterState(source: TupleReader) {
    const _totalSupply = source.readBigNumber();
    const _mintable = source.readBoolean();
    const _adminAddress = source.readAddress();
    const _jettonContent = source.readCell();
    const _jettonWalletCode = source.readCell();
    return { $$type: 'JettonMinterState' as const, totalSupply: _totalSupply, mintable: _mintable, adminAddress: _adminAddress, jettonContent: _jettonContent, jettonWalletCode: _jettonWalletCode };
}

export function storeTupleJettonMinterState(source: JettonMinterState) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.totalSupply);
    builder.writeBoolean(source.mintable);
    builder.writeAddress(source.adminAddress);
    builder.writeCell(source.jettonContent);
    builder.writeCell(source.jettonWalletCode);
    return builder.build();
}

export function dictValueParserJettonMinterState(): DictionaryValue<JettonMinterState> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonMinterState(src)).endCell());
        },
        parse: (src) => {
            return loadJettonMinterState(src.loadRef().beginParse());
        }
    }
}

export type GovernanceJettonMinter$Data = {
    $$type: 'GovernanceJettonMinter$Data';
    totalSupply: bigint;
    adminAddress: Address;
    nextAdminAddress: Address | null;
    jettonContent: Cell;
}

export function storeGovernanceJettonMinter$Data(src: GovernanceJettonMinter$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeCoins(src.totalSupply);
        b_0.storeAddress(src.adminAddress);
        b_0.storeAddress(src.nextAdminAddress);
        b_0.storeRef(src.jettonContent);
    };
}

export function loadGovernanceJettonMinter$Data(slice: Slice) {
    const sc_0 = slice;
    const _totalSupply = sc_0.loadCoins();
    const _adminAddress = sc_0.loadAddress();
    const _nextAdminAddress = sc_0.loadMaybeAddress();
    const _jettonContent = sc_0.loadRef();
    return { $$type: 'GovernanceJettonMinter$Data' as const, totalSupply: _totalSupply, adminAddress: _adminAddress, nextAdminAddress: _nextAdminAddress, jettonContent: _jettonContent };
}

export function loadTupleGovernanceJettonMinter$Data(source: TupleReader) {
    const _totalSupply = source.readBigNumber();
    const _adminAddress = source.readAddress();
    const _nextAdminAddress = source.readAddressOpt();
    const _jettonContent = source.readCell();
    return { $$type: 'GovernanceJettonMinter$Data' as const, totalSupply: _totalSupply, adminAddress: _adminAddress, nextAdminAddress: _nextAdminAddress, jettonContent: _jettonContent };
}

export function loadGetterTupleGovernanceJettonMinter$Data(source: TupleReader) {
    const _totalSupply = source.readBigNumber();
    const _adminAddress = source.readAddress();
    const _nextAdminAddress = source.readAddressOpt();
    const _jettonContent = source.readCell();
    return { $$type: 'GovernanceJettonMinter$Data' as const, totalSupply: _totalSupply, adminAddress: _adminAddress, nextAdminAddress: _nextAdminAddress, jettonContent: _jettonContent };
}

export function storeTupleGovernanceJettonMinter$Data(source: GovernanceJettonMinter$Data) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.totalSupply);
    builder.writeAddress(source.adminAddress);
    builder.writeAddress(source.nextAdminAddress);
    builder.writeCell(source.jettonContent);
    return builder.build();
}

export function dictValueParserGovernanceJettonMinter$Data(): DictionaryValue<GovernanceJettonMinter$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeGovernanceJettonMinter$Data(src)).endCell());
        },
        parse: (src) => {
            return loadGovernanceJettonMinter$Data(src.loadRef().beginParse());
        }
    }
}

export type JettonWalletGovernance$Data = {
    $$type: 'JettonWalletGovernance$Data';
    status: bigint;
    balance: bigint;
    owner: Address;
    master: Address;
}

export function storeJettonWalletGovernance$Data(src: JettonWalletGovernance$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(src.status, 4);
        b_0.storeCoins(src.balance);
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.master);
    };
}

export function loadJettonWalletGovernance$Data(slice: Slice) {
    const sc_0 = slice;
    const _status = sc_0.loadUintBig(4);
    const _balance = sc_0.loadCoins();
    const _owner = sc_0.loadAddress();
    const _master = sc_0.loadAddress();
    return { $$type: 'JettonWalletGovernance$Data' as const, status: _status, balance: _balance, owner: _owner, master: _master };
}

export function loadTupleJettonWalletGovernance$Data(source: TupleReader) {
    const _status = source.readBigNumber();
    const _balance = source.readBigNumber();
    const _owner = source.readAddress();
    const _master = source.readAddress();
    return { $$type: 'JettonWalletGovernance$Data' as const, status: _status, balance: _balance, owner: _owner, master: _master };
}

export function loadGetterTupleJettonWalletGovernance$Data(source: TupleReader) {
    const _status = source.readBigNumber();
    const _balance = source.readBigNumber();
    const _owner = source.readAddress();
    const _master = source.readAddress();
    return { $$type: 'JettonWalletGovernance$Data' as const, status: _status, balance: _balance, owner: _owner, master: _master };
}

export function storeTupleJettonWalletGovernance$Data(source: JettonWalletGovernance$Data) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.status);
    builder.writeNumber(source.balance);
    builder.writeAddress(source.owner);
    builder.writeAddress(source.master);
    return builder.build();
}

export function dictValueParserJettonWalletGovernance$Data(): DictionaryValue<JettonWalletGovernance$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonWalletGovernance$Data(src)).endCell());
        },
        parse: (src) => {
            return loadJettonWalletGovernance$Data(src.loadRef().beginParse());
        }
    }
}

export type JettonData = {
    $$type: 'JettonData';
    totalSupply: bigint;
    mintable: boolean;
    owner: Address;
    content: Cell;
    jettonWalletCode: Cell;
}

export function storeJettonData(src: JettonData) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.totalSupply, 257);
        b_0.storeBit(src.mintable);
        b_0.storeAddress(src.owner);
        b_0.storeRef(src.content);
        b_0.storeRef(src.jettonWalletCode);
    };
}

export function loadJettonData(slice: Slice) {
    const sc_0 = slice;
    const _totalSupply = sc_0.loadIntBig(257);
    const _mintable = sc_0.loadBit();
    const _owner = sc_0.loadAddress();
    const _content = sc_0.loadRef();
    const _jettonWalletCode = sc_0.loadRef();
    return { $$type: 'JettonData' as const, totalSupply: _totalSupply, mintable: _mintable, owner: _owner, content: _content, jettonWalletCode: _jettonWalletCode };
}

export function loadTupleJettonData(source: TupleReader) {
    const _totalSupply = source.readBigNumber();
    const _mintable = source.readBoolean();
    const _owner = source.readAddress();
    const _content = source.readCell();
    const _jettonWalletCode = source.readCell();
    return { $$type: 'JettonData' as const, totalSupply: _totalSupply, mintable: _mintable, owner: _owner, content: _content, jettonWalletCode: _jettonWalletCode };
}

export function loadGetterTupleJettonData(source: TupleReader) {
    const _totalSupply = source.readBigNumber();
    const _mintable = source.readBoolean();
    const _owner = source.readAddress();
    const _content = source.readCell();
    const _jettonWalletCode = source.readCell();
    return { $$type: 'JettonData' as const, totalSupply: _totalSupply, mintable: _mintable, owner: _owner, content: _content, jettonWalletCode: _jettonWalletCode };
}

export function storeTupleJettonData(source: JettonData) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.totalSupply);
    builder.writeBoolean(source.mintable);
    builder.writeAddress(source.owner);
    builder.writeCell(source.content);
    builder.writeCell(source.jettonWalletCode);
    return builder.build();
}

export function dictValueParserJettonData(): DictionaryValue<JettonData> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonData(src)).endCell());
        },
        parse: (src) => {
            return loadJettonData(src.loadRef().beginParse());
        }
    }
}

export type JettonWalletData = {
    $$type: 'JettonWalletData';
    balance: bigint;
    owner: Address;
    minter: Address;
    code: Cell;
}

export function storeJettonWalletData(src: JettonWalletData) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.balance, 257);
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.minter);
        b_0.storeRef(src.code);
    };
}

export function loadJettonWalletData(slice: Slice) {
    const sc_0 = slice;
    const _balance = sc_0.loadIntBig(257);
    const _owner = sc_0.loadAddress();
    const _minter = sc_0.loadAddress();
    const _code = sc_0.loadRef();
    return { $$type: 'JettonWalletData' as const, balance: _balance, owner: _owner, minter: _minter, code: _code };
}

export function loadTupleJettonWalletData(source: TupleReader) {
    const _balance = source.readBigNumber();
    const _owner = source.readAddress();
    const _minter = source.readAddress();
    const _code = source.readCell();
    return { $$type: 'JettonWalletData' as const, balance: _balance, owner: _owner, minter: _minter, code: _code };
}

export function loadGetterTupleJettonWalletData(source: TupleReader) {
    const _balance = source.readBigNumber();
    const _owner = source.readAddress();
    const _minter = source.readAddress();
    const _code = source.readCell();
    return { $$type: 'JettonWalletData' as const, balance: _balance, owner: _owner, minter: _minter, code: _code };
}

export function storeTupleJettonWalletData(source: JettonWalletData) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.balance);
    builder.writeAddress(source.owner);
    builder.writeAddress(source.minter);
    builder.writeCell(source.code);
    return builder.build();
}

export function dictValueParserJettonWalletData(): DictionaryValue<JettonWalletData> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonWalletData(src)).endCell());
        },
        parse: (src) => {
            return loadJettonWalletData(src.loadRef().beginParse());
        }
    }
}

export type MaybeAddress = {
    $$type: 'MaybeAddress';
    address: Address | null;
}

export function storeMaybeAddress(src: MaybeAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.address);
    };
}

export function loadMaybeAddress(slice: Slice) {
    const sc_0 = slice;
    const _address = sc_0.loadMaybeAddress();
    return { $$type: 'MaybeAddress' as const, address: _address };
}

export function loadTupleMaybeAddress(source: TupleReader) {
    const _address = source.readAddressOpt();
    return { $$type: 'MaybeAddress' as const, address: _address };
}

export function loadGetterTupleMaybeAddress(source: TupleReader) {
    const _address = source.readAddressOpt();
    return { $$type: 'MaybeAddress' as const, address: _address };
}

export function storeTupleMaybeAddress(source: MaybeAddress) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.address);
    return builder.build();
}

export function dictValueParserMaybeAddress(): DictionaryValue<MaybeAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMaybeAddress(src)).endCell());
        },
        parse: (src) => {
            return loadMaybeAddress(src.loadRef().beginParse());
        }
    }
}

export type JettonTransfer = {
    $$type: 'JettonTransfer';
    queryId: bigint;
    amount: bigint;
    destination: Address;
    responseDestination: Address | null;
    customPayload: Cell | null;
    forwardTonAmount: bigint;
    forwardPayload: Slice;
}

export function storeJettonTransfer(src: JettonTransfer) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(260734629, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.destination);
        b_0.storeAddress(src.responseDestination);
        if (src.customPayload !== null && src.customPayload !== undefined) { b_0.storeBit(true).storeRef(src.customPayload); } else { b_0.storeBit(false); }
        b_0.storeCoins(src.forwardTonAmount);
        b_0.storeBuilder(src.forwardPayload.asBuilder());
    };
}

export function loadJettonTransfer(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 260734629) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _amount = sc_0.loadCoins();
    const _destination = sc_0.loadAddress();
    const _responseDestination = sc_0.loadMaybeAddress();
    const _customPayload = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _forwardTonAmount = sc_0.loadCoins();
    const _forwardPayload = sc_0;
    return { $$type: 'JettonTransfer' as const, queryId: _queryId, amount: _amount, destination: _destination, responseDestination: _responseDestination, customPayload: _customPayload, forwardTonAmount: _forwardTonAmount, forwardPayload: _forwardPayload };
}

export function loadTupleJettonTransfer(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _destination = source.readAddress();
    const _responseDestination = source.readAddressOpt();
    const _customPayload = source.readCellOpt();
    const _forwardTonAmount = source.readBigNumber();
    const _forwardPayload = source.readCell().asSlice();
    return { $$type: 'JettonTransfer' as const, queryId: _queryId, amount: _amount, destination: _destination, responseDestination: _responseDestination, customPayload: _customPayload, forwardTonAmount: _forwardTonAmount, forwardPayload: _forwardPayload };
}

export function loadGetterTupleJettonTransfer(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _destination = source.readAddress();
    const _responseDestination = source.readAddressOpt();
    const _customPayload = source.readCellOpt();
    const _forwardTonAmount = source.readBigNumber();
    const _forwardPayload = source.readCell().asSlice();
    return { $$type: 'JettonTransfer' as const, queryId: _queryId, amount: _amount, destination: _destination, responseDestination: _responseDestination, customPayload: _customPayload, forwardTonAmount: _forwardTonAmount, forwardPayload: _forwardPayload };
}

export function storeTupleJettonTransfer(source: JettonTransfer) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.destination);
    builder.writeAddress(source.responseDestination);
    builder.writeCell(source.customPayload);
    builder.writeNumber(source.forwardTonAmount);
    builder.writeSlice(source.forwardPayload.asCell());
    return builder.build();
}

export function dictValueParserJettonTransfer(): DictionaryValue<JettonTransfer> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonTransfer(src)).endCell());
        },
        parse: (src) => {
            return loadJettonTransfer(src.loadRef().beginParse());
        }
    }
}

export type JettonBurn = {
    $$type: 'JettonBurn';
    queryId: bigint;
    amount: bigint;
    responseDestination: Address | null;
    customPayload: Cell | null;
}

export function storeJettonBurn(src: JettonBurn) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1499400124, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.responseDestination);
        if (src.customPayload !== null && src.customPayload !== undefined) { b_0.storeBit(true).storeRef(src.customPayload); } else { b_0.storeBit(false); }
    };
}

export function loadJettonBurn(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1499400124) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _amount = sc_0.loadCoins();
    const _responseDestination = sc_0.loadMaybeAddress();
    const _customPayload = sc_0.loadBit() ? sc_0.loadRef() : null;
    return { $$type: 'JettonBurn' as const, queryId: _queryId, amount: _amount, responseDestination: _responseDestination, customPayload: _customPayload };
}

export function loadTupleJettonBurn(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _responseDestination = source.readAddressOpt();
    const _customPayload = source.readCellOpt();
    return { $$type: 'JettonBurn' as const, queryId: _queryId, amount: _amount, responseDestination: _responseDestination, customPayload: _customPayload };
}

export function loadGetterTupleJettonBurn(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _responseDestination = source.readAddressOpt();
    const _customPayload = source.readCellOpt();
    return { $$type: 'JettonBurn' as const, queryId: _queryId, amount: _amount, responseDestination: _responseDestination, customPayload: _customPayload };
}

export function storeTupleJettonBurn(source: JettonBurn) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.responseDestination);
    builder.writeCell(source.customPayload);
    return builder.build();
}

export function dictValueParserJettonBurn(): DictionaryValue<JettonBurn> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonBurn(src)).endCell());
        },
        parse: (src) => {
            return loadJettonBurn(src.loadRef().beginParse());
        }
    }
}

export type JettonNotification = {
    $$type: 'JettonNotification';
    queryId: bigint;
    amount: bigint;
    sender: Address;
    forwardPayload: Slice;
}

export function storeJettonNotification(src: JettonNotification) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1935855772, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.sender);
        b_0.storeBuilder(src.forwardPayload.asBuilder());
    };
}

export function loadJettonNotification(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1935855772) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _amount = sc_0.loadCoins();
    const _sender = sc_0.loadAddress();
    const _forwardPayload = sc_0;
    return { $$type: 'JettonNotification' as const, queryId: _queryId, amount: _amount, sender: _sender, forwardPayload: _forwardPayload };
}

export function loadTupleJettonNotification(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _sender = source.readAddress();
    const _forwardPayload = source.readCell().asSlice();
    return { $$type: 'JettonNotification' as const, queryId: _queryId, amount: _amount, sender: _sender, forwardPayload: _forwardPayload };
}

export function loadGetterTupleJettonNotification(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _sender = source.readAddress();
    const _forwardPayload = source.readCell().asSlice();
    return { $$type: 'JettonNotification' as const, queryId: _queryId, amount: _amount, sender: _sender, forwardPayload: _forwardPayload };
}

export function storeTupleJettonNotification(source: JettonNotification) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.sender);
    builder.writeSlice(source.forwardPayload.asCell());
    return builder.build();
}

export function dictValueParserJettonNotification(): DictionaryValue<JettonNotification> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonNotification(src)).endCell());
        },
        parse: (src) => {
            return loadJettonNotification(src.loadRef().beginParse());
        }
    }
}

export type JettonExcesses = {
    $$type: 'JettonExcesses';
    queryId: bigint;
}

export function storeJettonExcesses(src: JettonExcesses) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3576854235, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadJettonExcesses(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3576854235) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'JettonExcesses' as const, queryId: _queryId };
}

export function loadTupleJettonExcesses(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'JettonExcesses' as const, queryId: _queryId };
}

export function loadGetterTupleJettonExcesses(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'JettonExcesses' as const, queryId: _queryId };
}

export function storeTupleJettonExcesses(source: JettonExcesses) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserJettonExcesses(): DictionaryValue<JettonExcesses> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonExcesses(src)).endCell());
        },
        parse: (src) => {
            return loadJettonExcesses(src.loadRef().beginParse());
        }
    }
}

export type JettonTransferInternal = {
    $$type: 'JettonTransferInternal';
    queryId: bigint;
    amount: bigint;
    sender: Address;
    responseDestination: Address | null;
    forwardTonAmount: bigint;
    forwardPayload: Slice;
}

export function storeJettonTransferInternal(src: JettonTransferInternal) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(395134233, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.sender);
        b_0.storeAddress(src.responseDestination);
        b_0.storeCoins(src.forwardTonAmount);
        b_0.storeBuilder(src.forwardPayload.asBuilder());
    };
}

export function loadJettonTransferInternal(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 395134233) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _amount = sc_0.loadCoins();
    const _sender = sc_0.loadAddress();
    const _responseDestination = sc_0.loadMaybeAddress();
    const _forwardTonAmount = sc_0.loadCoins();
    const _forwardPayload = sc_0;
    return { $$type: 'JettonTransferInternal' as const, queryId: _queryId, amount: _amount, sender: _sender, responseDestination: _responseDestination, forwardTonAmount: _forwardTonAmount, forwardPayload: _forwardPayload };
}

export function loadTupleJettonTransferInternal(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _sender = source.readAddress();
    const _responseDestination = source.readAddressOpt();
    const _forwardTonAmount = source.readBigNumber();
    const _forwardPayload = source.readCell().asSlice();
    return { $$type: 'JettonTransferInternal' as const, queryId: _queryId, amount: _amount, sender: _sender, responseDestination: _responseDestination, forwardTonAmount: _forwardTonAmount, forwardPayload: _forwardPayload };
}

export function loadGetterTupleJettonTransferInternal(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _sender = source.readAddress();
    const _responseDestination = source.readAddressOpt();
    const _forwardTonAmount = source.readBigNumber();
    const _forwardPayload = source.readCell().asSlice();
    return { $$type: 'JettonTransferInternal' as const, queryId: _queryId, amount: _amount, sender: _sender, responseDestination: _responseDestination, forwardTonAmount: _forwardTonAmount, forwardPayload: _forwardPayload };
}

export function storeTupleJettonTransferInternal(source: JettonTransferInternal) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.sender);
    builder.writeAddress(source.responseDestination);
    builder.writeNumber(source.forwardTonAmount);
    builder.writeSlice(source.forwardPayload.asCell());
    return builder.build();
}

export function dictValueParserJettonTransferInternal(): DictionaryValue<JettonTransferInternal> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonTransferInternal(src)).endCell());
        },
        parse: (src) => {
            return loadJettonTransferInternal(src.loadRef().beginParse());
        }
    }
}

export type JettonBurnNotification = {
    $$type: 'JettonBurnNotification';
    queryId: bigint;
    amount: bigint;
    sender: Address;
    responseDestination: Address | null;
}

export function storeJettonBurnNotification(src: JettonBurnNotification) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2078119902, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.sender);
        b_0.storeAddress(src.responseDestination);
    };
}

export function loadJettonBurnNotification(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2078119902) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _amount = sc_0.loadCoins();
    const _sender = sc_0.loadAddress();
    const _responseDestination = sc_0.loadMaybeAddress();
    return { $$type: 'JettonBurnNotification' as const, queryId: _queryId, amount: _amount, sender: _sender, responseDestination: _responseDestination };
}

export function loadTupleJettonBurnNotification(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _sender = source.readAddress();
    const _responseDestination = source.readAddressOpt();
    return { $$type: 'JettonBurnNotification' as const, queryId: _queryId, amount: _amount, sender: _sender, responseDestination: _responseDestination };
}

export function loadGetterTupleJettonBurnNotification(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _sender = source.readAddress();
    const _responseDestination = source.readAddressOpt();
    return { $$type: 'JettonBurnNotification' as const, queryId: _queryId, amount: _amount, sender: _sender, responseDestination: _responseDestination };
}

export function storeTupleJettonBurnNotification(source: JettonBurnNotification) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.sender);
    builder.writeAddress(source.responseDestination);
    return builder.build();
}

export function dictValueParserJettonBurnNotification(): DictionaryValue<JettonBurnNotification> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonBurnNotification(src)).endCell());
        },
        parse: (src) => {
            return loadJettonBurnNotification(src.loadRef().beginParse());
        }
    }
}

export type ProvideWalletAddress = {
    $$type: 'ProvideWalletAddress';
    queryId: bigint;
    ownerAddress: Address;
    includeAddress: boolean;
}

export function storeProvideWalletAddress(src: ProvideWalletAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(745978227, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.ownerAddress);
        b_0.storeBit(src.includeAddress);
    };
}

export function loadProvideWalletAddress(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 745978227) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _ownerAddress = sc_0.loadAddress();
    const _includeAddress = sc_0.loadBit();
    return { $$type: 'ProvideWalletAddress' as const, queryId: _queryId, ownerAddress: _ownerAddress, includeAddress: _includeAddress };
}

export function loadTupleProvideWalletAddress(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _ownerAddress = source.readAddress();
    const _includeAddress = source.readBoolean();
    return { $$type: 'ProvideWalletAddress' as const, queryId: _queryId, ownerAddress: _ownerAddress, includeAddress: _includeAddress };
}

export function loadGetterTupleProvideWalletAddress(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _ownerAddress = source.readAddress();
    const _includeAddress = source.readBoolean();
    return { $$type: 'ProvideWalletAddress' as const, queryId: _queryId, ownerAddress: _ownerAddress, includeAddress: _includeAddress };
}

export function storeTupleProvideWalletAddress(source: ProvideWalletAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.ownerAddress);
    builder.writeBoolean(source.includeAddress);
    return builder.build();
}

export function dictValueParserProvideWalletAddress(): DictionaryValue<ProvideWalletAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeProvideWalletAddress(src)).endCell());
        },
        parse: (src) => {
            return loadProvideWalletAddress(src.loadRef().beginParse());
        }
    }
}

export type TakeWalletAddress = {
    $$type: 'TakeWalletAddress';
    queryId: bigint;
    walletAddress: Address;
    ownerAddress: Cell | null;
}

export function storeTakeWalletAddress(src: TakeWalletAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3513996288, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.walletAddress);
        if (src.ownerAddress !== null && src.ownerAddress !== undefined) { b_0.storeBit(true).storeRef(src.ownerAddress); } else { b_0.storeBit(false); }
    };
}

export function loadTakeWalletAddress(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3513996288) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _walletAddress = sc_0.loadAddress();
    const _ownerAddress = sc_0.loadBit() ? sc_0.loadRef() : null;
    return { $$type: 'TakeWalletAddress' as const, queryId: _queryId, walletAddress: _walletAddress, ownerAddress: _ownerAddress };
}

export function loadTupleTakeWalletAddress(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _walletAddress = source.readAddress();
    const _ownerAddress = source.readCellOpt();
    return { $$type: 'TakeWalletAddress' as const, queryId: _queryId, walletAddress: _walletAddress, ownerAddress: _ownerAddress };
}

export function loadGetterTupleTakeWalletAddress(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _walletAddress = source.readAddress();
    const _ownerAddress = source.readCellOpt();
    return { $$type: 'TakeWalletAddress' as const, queryId: _queryId, walletAddress: _walletAddress, ownerAddress: _ownerAddress };
}

export function storeTupleTakeWalletAddress(source: TakeWalletAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.walletAddress);
    builder.writeCell(source.ownerAddress);
    return builder.build();
}

export function dictValueParserTakeWalletAddress(): DictionaryValue<TakeWalletAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTakeWalletAddress(src)).endCell());
        },
        parse: (src) => {
            return loadTakeWalletAddress(src.loadRef().beginParse());
        }
    }
}

export type TopUp = {
    $$type: 'TopUp';
    queryId: bigint;
}

export function storeTopUp(src: TopUp) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3547469196, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadTopUp(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3547469196) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'TopUp' as const, queryId: _queryId };
}

export function loadTupleTopUp(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'TopUp' as const, queryId: _queryId };
}

export function loadGetterTupleTopUp(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'TopUp' as const, queryId: _queryId };
}

export function storeTupleTopUp(source: TopUp) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserTopUp(): DictionaryValue<TopUp> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTopUp(src)).endCell());
        },
        parse: (src) => {
            return loadTopUp(src.loadRef().beginParse());
        }
    }
}

export type SetStatus = {
    $$type: 'SetStatus';
    queryId: bigint;
    status: bigint;
}

export function storeSetStatus(src: SetStatus) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(4006754003, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeUint(src.status, 4);
    };
}

export function loadSetStatus(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 4006754003) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _status = sc_0.loadUintBig(4);
    return { $$type: 'SetStatus' as const, queryId: _queryId, status: _status };
}

export function loadTupleSetStatus(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _status = source.readBigNumber();
    return { $$type: 'SetStatus' as const, queryId: _queryId, status: _status };
}

export function loadGetterTupleSetStatus(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _status = source.readBigNumber();
    return { $$type: 'SetStatus' as const, queryId: _queryId, status: _status };
}

export function storeTupleSetStatus(source: SetStatus) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.status);
    return builder.build();
}

export function dictValueParserSetStatus(): DictionaryValue<SetStatus> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetStatus(src)).endCell());
        },
        parse: (src) => {
            return loadSetStatus(src.loadRef().beginParse());
        }
    }
}

export type Mint = {
    $$type: 'Mint';
    queryId: bigint;
    toAddress: Address;
    masterMsg: JettonTransferInternal;
}

export function storeMint(src: Mint) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1680571655, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.toAddress);
        const b_1 = new Builder();
        b_1.store(storeJettonTransferInternal(src.masterMsg));
        b_0.storeRef(b_1.endCell());
    };
}

export function loadMint(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1680571655) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _toAddress = sc_0.loadAddress();
    const sc_1 = sc_0.loadRef().beginParse();
    const _masterMsg = loadJettonTransferInternal(sc_1);
    return { $$type: 'Mint' as const, queryId: _queryId, toAddress: _toAddress, masterMsg: _masterMsg };
}

export function loadTupleMint(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _toAddress = source.readAddress();
    const _masterMsg = loadTupleJettonTransferInternal(source);
    return { $$type: 'Mint' as const, queryId: _queryId, toAddress: _toAddress, masterMsg: _masterMsg };
}

export function loadGetterTupleMint(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _toAddress = source.readAddress();
    const _masterMsg = loadGetterTupleJettonTransferInternal(source);
    return { $$type: 'Mint' as const, queryId: _queryId, toAddress: _toAddress, masterMsg: _masterMsg };
}

export function storeTupleMint(source: Mint) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.toAddress);
    builder.writeTuple(storeTupleJettonTransferInternal(source.masterMsg));
    return builder.build();
}

export function dictValueParserMint(): DictionaryValue<Mint> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMint(src)).endCell());
        },
        parse: (src) => {
            return loadMint(src.loadRef().beginParse());
        }
    }
}

export type ChangeAdmin = {
    $$type: 'ChangeAdmin';
    queryId: bigint;
    newAdminAddress: Address;
}

export function storeChangeAdmin(src: ChangeAdmin) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1694626644, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.newAdminAddress);
    };
}

export function loadChangeAdmin(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1694626644) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _newAdminAddress = sc_0.loadAddress();
    return { $$type: 'ChangeAdmin' as const, queryId: _queryId, newAdminAddress: _newAdminAddress };
}

export function loadTupleChangeAdmin(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newAdminAddress = source.readAddress();
    return { $$type: 'ChangeAdmin' as const, queryId: _queryId, newAdminAddress: _newAdminAddress };
}

export function loadGetterTupleChangeAdmin(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newAdminAddress = source.readAddress();
    return { $$type: 'ChangeAdmin' as const, queryId: _queryId, newAdminAddress: _newAdminAddress };
}

export function storeTupleChangeAdmin(source: ChangeAdmin) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.newAdminAddress);
    return builder.build();
}

export function dictValueParserChangeAdmin(): DictionaryValue<ChangeAdmin> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeAdmin(src)).endCell());
        },
        parse: (src) => {
            return loadChangeAdmin(src.loadRef().beginParse());
        }
    }
}

export type ClaimAdmin = {
    $$type: 'ClaimAdmin';
    queryId: bigint;
}

export function storeClaimAdmin(src: ClaimAdmin) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(4220051737, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadClaimAdmin(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 4220051737) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'ClaimAdmin' as const, queryId: _queryId };
}

export function loadTupleClaimAdmin(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'ClaimAdmin' as const, queryId: _queryId };
}

export function loadGetterTupleClaimAdmin(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'ClaimAdmin' as const, queryId: _queryId };
}

export function storeTupleClaimAdmin(source: ClaimAdmin) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserClaimAdmin(): DictionaryValue<ClaimAdmin> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeClaimAdmin(src)).endCell());
        },
        parse: (src) => {
            return loadClaimAdmin(src.loadRef().beginParse());
        }
    }
}

export type CallTo = {
    $$type: 'CallTo';
    queryId: bigint;
    toAddress: Address;
    tonAmount: bigint;
    masterMsg: Cell;
}

export function storeCallTo(src: CallTo) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(593276754, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.toAddress);
        b_0.storeCoins(src.tonAmount);
        b_0.storeRef(src.masterMsg);
    };
}

export function loadCallTo(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 593276754) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _toAddress = sc_0.loadAddress();
    const _tonAmount = sc_0.loadCoins();
    const _masterMsg = sc_0.loadRef();
    return { $$type: 'CallTo' as const, queryId: _queryId, toAddress: _toAddress, tonAmount: _tonAmount, masterMsg: _masterMsg };
}

export function loadTupleCallTo(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _toAddress = source.readAddress();
    const _tonAmount = source.readBigNumber();
    const _masterMsg = source.readCell();
    return { $$type: 'CallTo' as const, queryId: _queryId, toAddress: _toAddress, tonAmount: _tonAmount, masterMsg: _masterMsg };
}

export function loadGetterTupleCallTo(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _toAddress = source.readAddress();
    const _tonAmount = source.readBigNumber();
    const _masterMsg = source.readCell();
    return { $$type: 'CallTo' as const, queryId: _queryId, toAddress: _toAddress, tonAmount: _tonAmount, masterMsg: _masterMsg };
}

export function storeTupleCallTo(source: CallTo) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.toAddress);
    builder.writeNumber(source.tonAmount);
    builder.writeCell(source.masterMsg);
    return builder.build();
}

export function dictValueParserCallTo(): DictionaryValue<CallTo> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeCallTo(src)).endCell());
        },
        parse: (src) => {
            return loadCallTo(src.loadRef().beginParse());
        }
    }
}

export type Upgrade = {
    $$type: 'Upgrade';
    queryId: bigint;
    newData: Cell;
    newCode: Cell;
}

export function storeUpgrade(src: Upgrade) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(621336170, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeRef(src.newData);
        b_0.storeRef(src.newCode);
    };
}

export function loadUpgrade(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 621336170) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _newData = sc_0.loadRef();
    const _newCode = sc_0.loadRef();
    return { $$type: 'Upgrade' as const, queryId: _queryId, newData: _newData, newCode: _newCode };
}

export function loadTupleUpgrade(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newData = source.readCell();
    const _newCode = source.readCell();
    return { $$type: 'Upgrade' as const, queryId: _queryId, newData: _newData, newCode: _newCode };
}

export function loadGetterTupleUpgrade(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newData = source.readCell();
    const _newCode = source.readCell();
    return { $$type: 'Upgrade' as const, queryId: _queryId, newData: _newData, newCode: _newCode };
}

export function storeTupleUpgrade(source: Upgrade) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeCell(source.newData);
    builder.writeCell(source.newCode);
    return builder.build();
}

export function dictValueParserUpgrade(): DictionaryValue<Upgrade> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUpgrade(src)).endCell());
        },
        parse: (src) => {
            return loadUpgrade(src.loadRef().beginParse());
        }
    }
}

export type ChangeMetadataUri = {
    $$type: 'ChangeMetadataUri';
    queryId: bigint;
    metadata: Slice;
}

export function storeChangeMetadataUri(src: ChangeMetadataUri) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3414567170, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeBuilder(src.metadata.asBuilder());
    };
}

export function loadChangeMetadataUri(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3414567170) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _metadata = sc_0;
    return { $$type: 'ChangeMetadataUri' as const, queryId: _queryId, metadata: _metadata };
}

export function loadTupleChangeMetadataUri(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _metadata = source.readCell().asSlice();
    return { $$type: 'ChangeMetadataUri' as const, queryId: _queryId, metadata: _metadata };
}

export function loadGetterTupleChangeMetadataUri(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _metadata = source.readCell().asSlice();
    return { $$type: 'ChangeMetadataUri' as const, queryId: _queryId, metadata: _metadata };
}

export function storeTupleChangeMetadataUri(source: ChangeMetadataUri) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeSlice(source.metadata.asCell());
    return builder.build();
}

export function dictValueParserChangeMetadataUri(): DictionaryValue<ChangeMetadataUri> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeMetadataUri(src)).endCell());
        },
        parse: (src) => {
            return loadChangeMetadataUri(src.loadRef().beginParse());
        }
    }
}

export type ProvideWalletBalance = {
    $$type: 'ProvideWalletBalance';
    receiver: Address;
    includeVerifyInfo: boolean;
}

export function storeProvideWalletBalance(src: ProvideWalletBalance) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2059982169, 32);
        b_0.storeAddress(src.receiver);
        b_0.storeBit(src.includeVerifyInfo);
    };
}

export function loadProvideWalletBalance(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2059982169) { throw Error('Invalid prefix'); }
    const _receiver = sc_0.loadAddress();
    const _includeVerifyInfo = sc_0.loadBit();
    return { $$type: 'ProvideWalletBalance' as const, receiver: _receiver, includeVerifyInfo: _includeVerifyInfo };
}

export function loadTupleProvideWalletBalance(source: TupleReader) {
    const _receiver = source.readAddress();
    const _includeVerifyInfo = source.readBoolean();
    return { $$type: 'ProvideWalletBalance' as const, receiver: _receiver, includeVerifyInfo: _includeVerifyInfo };
}

export function loadGetterTupleProvideWalletBalance(source: TupleReader) {
    const _receiver = source.readAddress();
    const _includeVerifyInfo = source.readBoolean();
    return { $$type: 'ProvideWalletBalance' as const, receiver: _receiver, includeVerifyInfo: _includeVerifyInfo };
}

export function storeTupleProvideWalletBalance(source: ProvideWalletBalance) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.receiver);
    builder.writeBoolean(source.includeVerifyInfo);
    return builder.build();
}

export function dictValueParserProvideWalletBalance(): DictionaryValue<ProvideWalletBalance> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeProvideWalletBalance(src)).endCell());
        },
        parse: (src) => {
            return loadProvideWalletBalance(src.loadRef().beginParse());
        }
    }
}

export type VerifyInfo = {
    $$type: 'VerifyInfo';
    owner: Address;
    minter: Address;
    code: Cell;
}

export function storeVerifyInfo(src: VerifyInfo) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.minter);
        b_0.storeRef(src.code);
    };
}

export function loadVerifyInfo(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _minter = sc_0.loadAddress();
    const _code = sc_0.loadRef();
    return { $$type: 'VerifyInfo' as const, owner: _owner, minter: _minter, code: _code };
}

export function loadTupleVerifyInfo(source: TupleReader) {
    const _owner = source.readAddress();
    const _minter = source.readAddress();
    const _code = source.readCell();
    return { $$type: 'VerifyInfo' as const, owner: _owner, minter: _minter, code: _code };
}

export function loadGetterTupleVerifyInfo(source: TupleReader) {
    const _owner = source.readAddress();
    const _minter = source.readAddress();
    const _code = source.readCell();
    return { $$type: 'VerifyInfo' as const, owner: _owner, minter: _minter, code: _code };
}

export function storeTupleVerifyInfo(source: VerifyInfo) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeAddress(source.minter);
    builder.writeCell(source.code);
    return builder.build();
}

export function dictValueParserVerifyInfo(): DictionaryValue<VerifyInfo> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVerifyInfo(src)).endCell());
        },
        parse: (src) => {
            return loadVerifyInfo(src.loadRef().beginParse());
        }
    }
}

export type TakeWalletBalance = {
    $$type: 'TakeWalletBalance';
    balance: bigint;
    verifyInfo: VerifyInfo | null;
}

export function storeTakeWalletBalance(src: TakeWalletBalance) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3396861378, 32);
        b_0.storeCoins(src.balance);
        if (src.verifyInfo !== null && src.verifyInfo !== undefined) { b_0.storeBit(true); b_0.store(storeVerifyInfo(src.verifyInfo)); } else { b_0.storeBit(false); }
    };
}

export function loadTakeWalletBalance(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3396861378) { throw Error('Invalid prefix'); }
    const _balance = sc_0.loadCoins();
    const _verifyInfo = sc_0.loadBit() ? loadVerifyInfo(sc_0) : null;
    return { $$type: 'TakeWalletBalance' as const, balance: _balance, verifyInfo: _verifyInfo };
}

export function loadTupleTakeWalletBalance(source: TupleReader) {
    const _balance = source.readBigNumber();
    const _verifyInfo_p = source.readTupleOpt();
    const _verifyInfo = _verifyInfo_p ? loadTupleVerifyInfo(_verifyInfo_p) : null;
    return { $$type: 'TakeWalletBalance' as const, balance: _balance, verifyInfo: _verifyInfo };
}

export function loadGetterTupleTakeWalletBalance(source: TupleReader) {
    const _balance = source.readBigNumber();
    const _verifyInfo_p = source.readTupleOpt();
    const _verifyInfo = _verifyInfo_p ? loadTupleVerifyInfo(_verifyInfo_p) : null;
    return { $$type: 'TakeWalletBalance' as const, balance: _balance, verifyInfo: _verifyInfo };
}

export function storeTupleTakeWalletBalance(source: TakeWalletBalance) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.balance);
    if (source.verifyInfo !== null && source.verifyInfo !== undefined) {
        builder.writeTuple(storeTupleVerifyInfo(source.verifyInfo));
    } else {
        builder.writeTuple(null);
    }
    return builder.build();
}

export function dictValueParserTakeWalletBalance(): DictionaryValue<TakeWalletBalance> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTakeWalletBalance(src)).endCell());
        },
        parse: (src) => {
            return loadTakeWalletBalance(src.loadRef().beginParse());
        }
    }
}

export type ContractVaultDAOv1$Data = {
    $$type: 'ContractVaultDAOv1$Data';
    owner: Address;
    status: bigint;
    data: OptionInfo;
}

export function storeContractVaultDAOv1$Data(src: ContractVaultDAOv1$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeUint(src.status, 4);
        b_0.store(storeOptionInfo(src.data));
    };
}

export function loadContractVaultDAOv1$Data(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _status = sc_0.loadUintBig(4);
    const _data = loadOptionInfo(sc_0);
    return { $$type: 'ContractVaultDAOv1$Data' as const, owner: _owner, status: _status, data: _data };
}

export function loadTupleContractVaultDAOv1$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _status = source.readBigNumber();
    const _data = loadTupleOptionInfo(source);
    return { $$type: 'ContractVaultDAOv1$Data' as const, owner: _owner, status: _status, data: _data };
}

export function loadGetterTupleContractVaultDAOv1$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _status = source.readBigNumber();
    const _data = loadGetterTupleOptionInfo(source);
    return { $$type: 'ContractVaultDAOv1$Data' as const, owner: _owner, status: _status, data: _data };
}

export function storeTupleContractVaultDAOv1$Data(source: ContractVaultDAOv1$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeNumber(source.status);
    builder.writeTuple(storeTupleOptionInfo(source.data));
    return builder.build();
}

export function dictValueParserContractVaultDAOv1$Data(): DictionaryValue<ContractVaultDAOv1$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContractVaultDAOv1$Data(src)).endCell());
        },
        parse: (src) => {
            return loadContractVaultDAOv1$Data(src.loadRef().beginParse());
        }
    }
}

export type ContractLightVotingV1$Data = {
    $$type: 'ContractLightVotingV1$Data';
    owner: Address;
    admin: Address;
    wallet: Address;
    seqno: bigint;
    status: bigint;
    metadata: Cell;
    settings: VoteSettings;
    options: Dictionary<Address, OptionInfoRoot>;
    winner: WinnerInfo;
    voted: Dictionary<Address, boolean>;
    stakes: Dictionary<Address, bigint>;
    weightSource: Address | null;
}

export function storeContractLightVotingV1$Data(src: ContractLightVotingV1$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.admin);
        b_0.storeAddress(src.wallet);
        b_0.storeUint(src.seqno, 32);
        b_0.storeUint(src.status, 4);
        b_0.storeRef(src.metadata);
        const b_1 = new Builder();
        b_1.store(storeVoteSettings(src.settings));
        b_1.storeDict(src.options, Dictionary.Keys.Address(), dictValueParserOptionInfoRoot());
        b_1.store(storeWinnerInfo(src.winner));
        b_1.storeDict(src.voted, Dictionary.Keys.Address(), Dictionary.Values.Bool());
        b_1.storeDict(src.stakes, Dictionary.Keys.Address(), Dictionary.Values.BigVarUint(4));
        const b_2 = new Builder();
        b_2.storeAddress(src.weightSource);
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadContractLightVotingV1$Data(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _admin = sc_0.loadAddress();
    const _wallet = sc_0.loadAddress();
    const _seqno = sc_0.loadUintBig(32);
    const _status = sc_0.loadUintBig(4);
    const _metadata = sc_0.loadRef();
    const sc_1 = sc_0.loadRef().beginParse();
    const _settings = loadVoteSettings(sc_1);
    const _options = Dictionary.load(Dictionary.Keys.Address(), dictValueParserOptionInfoRoot(), sc_1);
    const _winner = loadWinnerInfo(sc_1);
    const _voted = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.Bool(), sc_1);
    const _stakes = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigVarUint(4), sc_1);
    const sc_2 = sc_1.loadRef().beginParse();
    const _weightSource = sc_2.loadMaybeAddress();
    return { $$type: 'ContractLightVotingV1$Data' as const, owner: _owner, admin: _admin, wallet: _wallet, seqno: _seqno, status: _status, metadata: _metadata, settings: _settings, options: _options, winner: _winner, voted: _voted, stakes: _stakes, weightSource: _weightSource };
}

export function loadTupleContractLightVotingV1$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _admin = source.readAddress();
    const _wallet = source.readAddress();
    const _seqno = source.readBigNumber();
    const _status = source.readBigNumber();
    const _metadata = source.readCell();
    const _settings = loadTupleVoteSettings(source);
    const _options = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserOptionInfoRoot(), source.readCellOpt());
    const _winner = loadTupleWinnerInfo(source);
    const _voted = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.Bool(), source.readCellOpt());
    const _stakes = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigVarUint(4), source.readCellOpt());
    const _weightSource = source.readAddressOpt();
    return { $$type: 'ContractLightVotingV1$Data' as const, owner: _owner, admin: _admin, wallet: _wallet, seqno: _seqno, status: _status, metadata: _metadata, settings: _settings, options: _options, winner: _winner, voted: _voted, stakes: _stakes, weightSource: _weightSource };
}

export function loadGetterTupleContractLightVotingV1$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _admin = source.readAddress();
    const _wallet = source.readAddress();
    const _seqno = source.readBigNumber();
    const _status = source.readBigNumber();
    const _metadata = source.readCell();
    const _settings = loadGetterTupleVoteSettings(source);
    const _options = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserOptionInfoRoot(), source.readCellOpt());
    const _winner = loadGetterTupleWinnerInfo(source);
    const _voted = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.Bool(), source.readCellOpt());
    const _stakes = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigVarUint(4), source.readCellOpt());
    const _weightSource = source.readAddressOpt();
    return { $$type: 'ContractLightVotingV1$Data' as const, owner: _owner, admin: _admin, wallet: _wallet, seqno: _seqno, status: _status, metadata: _metadata, settings: _settings, options: _options, winner: _winner, voted: _voted, stakes: _stakes, weightSource: _weightSource };
}

export function storeTupleContractLightVotingV1$Data(source: ContractLightVotingV1$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeAddress(source.admin);
    builder.writeAddress(source.wallet);
    builder.writeNumber(source.seqno);
    builder.writeNumber(source.status);
    builder.writeCell(source.metadata);
    builder.writeTuple(storeTupleVoteSettings(source.settings));
    builder.writeCell(source.options.size > 0 ? beginCell().storeDictDirect(source.options, Dictionary.Keys.Address(), dictValueParserOptionInfoRoot()).endCell() : null);
    builder.writeTuple(storeTupleWinnerInfo(source.winner));
    builder.writeCell(source.voted.size > 0 ? beginCell().storeDictDirect(source.voted, Dictionary.Keys.Address(), Dictionary.Values.Bool()).endCell() : null);
    builder.writeCell(source.stakes.size > 0 ? beginCell().storeDictDirect(source.stakes, Dictionary.Keys.Address(), Dictionary.Values.BigVarUint(4)).endCell() : null);
    builder.writeAddress(source.weightSource);
    return builder.build();
}

export function dictValueParserContractLightVotingV1$Data(): DictionaryValue<ContractLightVotingV1$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContractLightVotingV1$Data(src)).endCell());
        },
        parse: (src) => {
            return loadContractLightVotingV1$Data(src.loadRef().beginParse());
        }
    }
}

 type ContractLightVotingV1_init_args = {
    $$type: 'ContractLightVotingV1_init_args';
    owner: Address;
    admin: Address;
    wallet: Address;
    seqno: bigint;
    status: bigint;
    metadata: Cell;
    settings: VoteSettings;
    options: Dictionary<Address, OptionInfoRoot>;
    winner: WinnerInfo;
    voted: Dictionary<Address, boolean>;
    stakes: Dictionary<Address, bigint>;
    weightSource: Address | null;
}

function initContractLightVotingV1_init_args(src: ContractLightVotingV1_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.admin);
        b_0.storeAddress(src.wallet);
        b_0.storeUint(src.seqno, 32);
        b_0.storeUint(src.status, 4);
        b_0.storeRef(src.metadata);
        const b_1 = new Builder();
        b_1.store(storeVoteSettings(src.settings));
        b_1.storeDict(src.options, Dictionary.Keys.Address(), dictValueParserOptionInfoRoot());
        b_1.store(storeWinnerInfo(src.winner));
        b_1.storeDict(src.voted, Dictionary.Keys.Address(), Dictionary.Values.Bool());
        b_1.storeDict(src.stakes, Dictionary.Keys.Address(), Dictionary.Values.BigVarUint(4));
        const b_2 = new Builder();
        b_2.storeAddress(src.weightSource);
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

async function ContractLightVotingV1_init(owner: Address, admin: Address, wallet: Address, seqno: bigint, status: bigint, metadata: Cell, settings: VoteSettings, options: Dictionary<Address, OptionInfoRoot>, winner: WinnerInfo, voted: Dictionary<Address, boolean>, stakes: Dictionary<Address, bigint>, weightSource: Address | null) {
    const __code = Cell.fromHex('b5ee9c7241023f01000c76000228ff008e88f4a413f4bcf2c80bed5320e303ed43d9011e0202710210020120030802015804060219b253b6cf36cf15c417c3db10601f050002700219b00bf6cf36cf15c417c3db10601f0700045610020148090e0201c70a0c0253a3836cf0444c4450444c4448444c44484444444844444440444444403c44403d543b6cf15c417c3db1061f0b00622281010b2259f40a6fa193fa003092306de26eb38e1781010b230259f40a6fa193fa003092306de2206ef2d080923070e20217a2436cf36cf15c417c3db1061f0d0002730219b31fb6cf36cf15c417c3db10601f0f00022e020120111602012012140219b5423b679b678ae20be1ed88301f1300022f0215b5265b679b678d98cd90d01f15000c547dcb547dcb0201e7171c020120181a0217a44db679b678ae20be1ed8831f190002270213a4f7b679b678d988d9091f1b0008547654260254a9b2db3c1113111411131112111311121111111211111110111111100f11100f550edb3c57105f0f6c411f1d003c81010b2402714133f40a6fa19401d70030925b6de27f216e925b7091bae203f430eda2edfb01d072d721d200d200fa4021103450666f04f86102f862db3c1115945f0f5f06e0705614d74920c21fe30001c00001c121b0945f0f5f06e01113f9012082f09f31fb7c139e4f1313022f5187d632af397344874ad3c3abb365f301d9d7ab67ba8e115f0f10355f058200f0f6f84258c705f2f4e0201f213401eced44d0fa40fa40fa40d31fd303d4d401d0d33ffa00fa00d307d307fa00555006f404d72c01916d93fa4001e201d33fd33fd200553004f404f404d430d0d72c01916d93fa4001e2310e11140e0e11130e0e11120e0e11110e0e11100e10ef10cd10bc10ab109a108910561045103457141112111311122000241111111211111110111111100f11100f550e04ea311114d31f2182107362d09cba8fdd3157141113d33f31fa00fa40f8416f24135f0301d430d0d31f8200a78403820afaf080bc13f2f420821055d9ab43bae30f1111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a107910681057104610354403e0218210c8b1f5abba2223332600fc5b8200f0f6015614c705f2f48200b26c2fc000f2f482008fb011115613c70501111101f2f4f842561381010b561359f40a6fa193fa003092306de26eb38e19561381010b561359f40a6fa193fa003092306de2206ef2d0809170e281010b1112a00211140201111101561201206e953059f4593098c801fa024133f441e201e88210383977b6ba8ee581474d56176ef2f48200b26c5611c001f2f48200f0f6f8425614c705f2f4812f57533ebef2f4817e22f823561001bcf2f4815dac2481010b24714133f40a6fa19401d70030925b6de27f216e925b7f91bde2f2f4fa40302881010b2259f40b6fa192306ddf925f03e211122401fe206e92306d8e13d0fa40d401d001d401d001d33f55306c146f04e2206ef2d0806f24335185a081010b5136a024431350aac855305034ce01c8cecd01c8cecdcb3fc9103a12206e953059f45930944133f413e20281010b287f71216e955b59f4593098c801cf004133f441e2561481010b2959f40a6fa193fa003092306de225007c6eb38e18561481010b2959f40a6fa193fa003092306de2206ef2d0809170e281010b03a00311150318206e953059f4593098c801fa024133f441e211120503fe8f7d3157141113d33f31d401d001d430d08200a784f8416f24135f038209312d00bcf2f48200b26c5610c000f2f48200f0f6f8425614c705917f96f8425615c705e2f2f4f8425321f828027002db3c705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d081010b272c2d012888c855315034cecb030201c8ce12cd01c8cecdc9280228ff008e88f4a413f4bcf2c80bed5320e303ed43d9292b0139a64582bb51343e9034c0f50074007500740484090408db0536cf1b10a02a00025c00ea3001d072d721d200d200fa4021103450666f04f86102f862ed44d0fa40d303d401d001d401d012102410236c1405925f05e003d70d1ff2e082308210db89bc8aba8e2c8200f0f6f84223c705f2f48200b26c01c000f2f4027159c855305034cecb030201c8ce12cd01c8cecdc9ed54e05f04f2c08202b454415470c855305034ce01c8cecd01c8cecdcb3fc9194330206e953059f45930944133f413e21112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a107908105710461035440302db3c3c3302fee02182103d0a0c10ba8eeb3157141113fa40fa40fa00308200f0f656176eb39bf8425618206ef2d080c7059170e2f2f48200b26c5611c001f2f4817e22f823561001bcf2f4815dac2481010b25714133f40a6fa19401d70030925b6de27f216e925b7f91bde2f2f42881010b2359f40b6fa192306ddfe0218210ebf2f4ceba2e3001fe206e92306d8e13d0fa40d401d001d401d001d33f55306c146f04e2206ef2d0806f24335183a00281010b04a024035099c855305034ce01c8cecd01c8cecdcb3fc9103912206e953059f45930944133f413e281010b50077f71216e955b59f4593098c801cf004133f441e2f8421112111411121111111311111110111211102f02460f11110f0e11100e10df10ce10bd10ac109b108a10791068105710461035443012db3c3c3301e88eef5b57138200d3d42ec002f2f4f842561381010b2259f40a6fa193fa003092306de26eb38e18561381010b2259f40a6fa193fa003092306de2206ef2d0809170e28200978321c200f2f45210111581010bf45930820afaf080802a6d71c87001cb00c9d01034031119032651374133c8e011153101f8556082100f8a7ea55008cb1f16cb3f5004fa0212ce01206e9430cf84809201cee2f40001fa02cec9561202111601706d50426d50427fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb001112111411121111111311111110111211100f11110f32023e0e11100e10df10ce10bd10ac109b108a10791068105710461035443012db3c3c3300dcc81114111311121111111055e0011113011114ce01111101ce1fce1dcb1f1bcb0319ccc855525056cb3f5003fa0201fa02cb07cb0701fa0212f4004344055043206e9430cf84809201cee2cb3f12cb3fca0012f40012f400c85003206e9430cf84809201cee212cdcdc9ed54db3102da82f0ac128f9294d44ed4e4ce25a81d30d9e4b45380aeb1780b49d17ad76dc9f692c6bae3023233330282f03f8bd49d13c13b558445a8696a0abe19ea23d46ac172f15f136e7e2aff3c2086ba8e988200b26c0bc0011bf2f4814135f8235290b9f2f4f8425222e05f0f5bf2c082353703ee308200f0f6f8425612c705917f96f8425613c705e2f2f48200b26c0ec0001ef2f4f8422b82103b9aca00b995f823500ca09b817e22f82352d0bcf2f40be27156146eb3e3001112111411121111111311111110111211100f11110f111010df1e10bd10ac109b108a10791068105710461035440302db3c363c3e00ac5614206ef2d0808209312d00727025c85982103d0a0c255003cb1fcb3fcb3fc95a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0003fe6d7f2381010bf4836fa520911295316d326d01e2908e4d206e92306d8e13d0fa40d401d001d401d001d33f55306c146f04e2206ef2d0806f246c315302bc209133923102e2029232219102e281010b54451459f4746fa5209402d4305895316d326d01e2e85b33597f7f22923070df53a2bc923070de29c2009170e30de30038393a000e23a76453a3a8bb0004307001f428c2009722a7645398a8b99170e2923070de94306d337fdf820afaf080705353c8552082103d0a0c035004cb1f12cb3f01206e9430cf84809201cee2cb3fc9561359706d50426d50427fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb003b02601111111311111110111211100f11110f0e11100e72111010df10ce10bd10ac109b108a1079106810471036450402db3c3c3e0178708042708810246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb003d001400000000726566756e6400d8c81114111311121111111055e0011113011114ce01111101ce1fce1dcb1f1bcb0319ccc855525056cb3f5003fa0201fa02cb07cb0701fa0212f4004344055043206e9430cf84809201cee2cb3f12cb3fca0012f40012f400c85003206e9430cf84809201cee212cdcdc9ed54cf7eef38');
    const builder = beginCell();
    initContractLightVotingV1_init_args({ $$type: 'ContractLightVotingV1_init_args', owner, admin, wallet, seqno, status, metadata, settings, options, winner, voted, stakes, weightSource })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const ContractLightVotingV1_errors = {
    2: { message: "Stack underflow" },
    3: { message: "Stack overflow" },
    4: { message: "Integer overflow" },
    5: { message: "Integer out of expected range" },
    6: { message: "Invalid opcode" },
    7: { message: "Type check error" },
    8: { message: "Cell overflow" },
    9: { message: "Cell underflow" },
    10: { message: "Dictionary error" },
    11: { message: "'Unknown' error" },
    12: { message: "Fatal error" },
    13: { message: "Out of gas error" },
    14: { message: "Virtualization error" },
    32: { message: "Action list is invalid" },
    33: { message: "Action list is too long" },
    34: { message: "Action is invalid or not supported" },
    35: { message: "Invalid source address in outbound message" },
    36: { message: "Invalid destination address in outbound message" },
    37: { message: "Not enough Toncoin" },
    38: { message: "Not enough extra currencies" },
    39: { message: "Outbound message does not fit into a cell after rewriting" },
    40: { message: "Cannot process a message" },
    41: { message: "Library reference is null" },
    42: { message: "Library change action error" },
    43: { message: "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree" },
    50: { message: "Account state size exceeded limits" },
    128: { message: "Null reference exception" },
    129: { message: "Invalid serialization prefix" },
    130: { message: "Invalid incoming message" },
    131: { message: "Constraints error" },
    132: { message: "Access denied" },
    133: { message: "Contract stopped" },
    134: { message: "Invalid argument" },
    135: { message: "Code of a contract was not found" },
    136: { message: "Invalid standard address" },
    138: { message: "Not a basechain address" },
    2366: { message: "Incorrect balance after send" },
    9215: { message: "Incorrect sender" },
    10363: { message: "Unauthorized burn" },
    12119: { message: "insufficient amount" },
    14534: { message: "Not owner" },
    16693: { message: "vote time is not over" },
    18253: { message: "use weight source" },
    21196: { message: "Contract is locked" },
    23980: { message: "already voted" },
    30277: { message: "Incoming transfers are locked" },
    32113: { message: "Insufficient amount of TON attached" },
    32290: { message: "vote time is over" },
    36784: { message: "wallet already bound" },
    38787: { message: "nothing to reclaim" },
    42884: { message: "gas error" },
    45676: { message: "wrong operation" },
    46257: { message: "Wrong workchain" },
    54228: { message: "voting not finalized" },
    61686: { message: "access denied" },
    63951: { message: "Not next admin" },
} as const

export const ContractLightVotingV1_errors_backward = {
    "Stack underflow": 2,
    "Stack overflow": 3,
    "Integer overflow": 4,
    "Integer out of expected range": 5,
    "Invalid opcode": 6,
    "Type check error": 7,
    "Cell overflow": 8,
    "Cell underflow": 9,
    "Dictionary error": 10,
    "'Unknown' error": 11,
    "Fatal error": 12,
    "Out of gas error": 13,
    "Virtualization error": 14,
    "Action list is invalid": 32,
    "Action list is too long": 33,
    "Action is invalid or not supported": 34,
    "Invalid source address in outbound message": 35,
    "Invalid destination address in outbound message": 36,
    "Not enough Toncoin": 37,
    "Not enough extra currencies": 38,
    "Outbound message does not fit into a cell after rewriting": 39,
    "Cannot process a message": 40,
    "Library reference is null": 41,
    "Library change action error": 42,
    "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree": 43,
    "Account state size exceeded limits": 50,
    "Null reference exception": 128,
    "Invalid serialization prefix": 129,
    "Invalid incoming message": 130,
    "Constraints error": 131,
    "Access denied": 132,
    "Contract stopped": 133,
    "Invalid argument": 134,
    "Code of a contract was not found": 135,
    "Invalid standard address": 136,
    "Not a basechain address": 138,
    "Incorrect balance after send": 2366,
    "Incorrect sender": 9215,
    "Unauthorized burn": 10363,
    "insufficient amount": 12119,
    "Not owner": 14534,
    "vote time is not over": 16693,
    "use weight source": 18253,
    "Contract is locked": 21196,
    "already voted": 23980,
    "Incoming transfers are locked": 30277,
    "Insufficient amount of TON attached": 32113,
    "vote time is over": 32290,
    "wallet already bound": 36784,
    "nothing to reclaim": 38787,
    "gas error": 42884,
    "wrong operation": 45676,
    "Wrong workchain": 46257,
    "voting not finalized": 54228,
    "access denied": 61686,
    "Not next admin": 63951,
} as const

const ContractLightVotingV1_types: ABIType[] = [
    {"name":"DataSize","header":null,"fields":[{"name":"cells","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bits","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"refs","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"SignedBundle","header":null,"fields":[{"name":"signature","type":{"kind":"simple","type":"fixed-bytes","optional":false,"format":64}},{"name":"signedData","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"StateInit","header":null,"fields":[{"name":"code","type":{"kind":"simple","type":"cell","optional":false}},{"name":"data","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"Context","header":null,"fields":[{"name":"bounceable","type":{"kind":"simple","type":"bool","optional":false}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"raw","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"SendParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"code","type":{"kind":"simple","type":"cell","optional":true}},{"name":"data","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"MessageParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"DeployParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}},{"name":"init","type":{"kind":"simple","type":"StateInit","optional":false}}]},
    {"name":"StdAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":8}},{"name":"address","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"VarAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":32}},{"name":"address","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"BasechainAddress","header":null,"fields":[{"name":"hash","type":{"kind":"simple","type":"int","optional":true,"format":257}}]},
    {"name":"DoMigrate","header":1024068618,"fields":[]},
    {"name":"DAOvote","header":1475729905,"fields":[{"name":"endTime","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"isJetton","type":{"kind":"simple","type":"bool","optional":false}},{"name":"isNFTSBT","type":{"kind":"simple","type":"bool","optional":false}},{"name":"metadata","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"WhiteList","header":3714265888,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"jettonWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"jettonMaster","type":{"kind":"simple","type":"address","optional":false}},{"name":"jettonFee","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"admin","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"DropCollection","header":2783320816,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"address","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeAdminCitizen","header":11,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"citizen","type":{"kind":"simple","type":"address","optional":false}},{"name":"address","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeOwnerDAO","header":7,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"address","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"GetFunds","header":8,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"jettonWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"jettonAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"AddAdmin","header":9,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"address","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"RemoveAdmin","header":10,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"address","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeTreasury","header":12,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"address","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"JettonTransferNotification","header":1935855772,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"forwardPayload","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"StartNewVoting","header":3100530816,"fields":[{"name":"metadata","type":{"kind":"simple","type":"cell","optional":false}},{"name":"settings","type":{"kind":"simple","type":"VoteSettings","optional":false}}]},
    {"name":"StartDAOVoting","header":718541994,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"metadata","type":{"kind":"simple","type":"cell","optional":false}},{"name":"settings","type":{"kind":"simple","type":"VoteSettings","optional":false}}]},
    {"name":"InitVoting","header":1440328515,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"totalSupply","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"ActivateVote","header":690358848,"fields":[{"name":"contractAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"admin","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"CallVote","header":435109211,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"GiveVote","header":3041426889,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"TakeVote","header":3958568142,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"TakeDAOVote","header":3914228146,"fields":[{"name":"adminAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"optionAddress","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"PassPassport","header":57069,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"address","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SetToken","header":3233865037,"fields":[{"name":"dao_fee","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"AddOption","header":3367105963,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"title","type":{"kind":"simple","type":"string","optional":false}},{"name":"description","type":{"kind":"simple","type":"string","optional":false}}]},
    {"name":"VaultInitialization","header":3683237002,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"admin","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"VirtualInitialization","header":226213212,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"optionAddress","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SubmitVoting","header":4022960818,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"adminAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"optionAddress","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"CancelVoting","header":502754399,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"adminAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"optionAddress","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ProvideAction","header":385206731,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"address","type":{"kind":"simple","type":"address","optional":false}},{"name":"payload","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"ProvideActionDAO","header":1847741543,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"admin","type":{"kind":"simple","type":"address","optional":false}},{"name":"payload","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"ProvideVoting","header":943290294,"fields":[{"name":"optionAddress","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"PassportControl","header":3735928559,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"citizen","type":{"kind":"simple","type":"address","optional":false}},{"name":"status","type":{"kind":"simple","type":"uint","optional":false,"format":4}}]},
    {"name":"CreateDao","header":1024068608,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"metadata","type":{"kind":"simple","type":"cell","optional":false}},{"name":"config","type":{"kind":"simple","type":"DaoConfig","optional":false}}]},
    {"name":"InitDaoWallet","header":1024068609,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"CreateVotingReq","header":1024068610,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"metadata","type":{"kind":"simple","type":"cell","optional":false}},{"name":"settings","type":{"kind":"simple","type":"VoteSettings","optional":false}},{"name":"action","type":{"kind":"simple","type":"DaoAction","optional":false}}]},
    {"name":"VotingFinished","header":1024068611,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"winner","type":{"kind":"simple","type":"address","optional":true}},{"name":"total","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"SetVerified","header":1024068612,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"verified","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"MarkDao","header":1024068613,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"dao","type":{"kind":"simple","type":"address","optional":false}},{"name":"verified","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"UpgradeCode","header":1024068614,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"code","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"BindJettonWallet","header":1024068640,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"wallet","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SetFactoryToken","header":1024068641,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"jetton_wallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"dao_fee","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"BindChildWallet","header":1024068642,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"which","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"wallet","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"InitDao","header":1024068643,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"voteJettonWallet","type":{"kind":"simple","type":"address","optional":true}},{"name":"params","type":{"kind":"dict","key":"int","value":"DaoParam","valueFormat":"ref"}}]},
    {"name":"RelayCreateVoting","header":1024068656,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"initiator","type":{"kind":"simple","type":"address","optional":false}},{"name":"metadata","type":{"kind":"simple","type":"cell","optional":false}},{"name":"settings","type":{"kind":"simple","type":"VoteSettings","optional":false}},{"name":"action","type":{"kind":"simple","type":"DaoAction","optional":false}}]},
    {"name":"RelayVotingAddOption","header":1024068657,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"voting","type":{"kind":"simple","type":"address","optional":false}},{"name":"title","type":{"kind":"simple","type":"string","optional":false}},{"name":"description","type":{"kind":"simple","type":"string","optional":false}}]},
    {"name":"RelayVotingStart","header":1024068658,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"voting","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"RelayWeightCast","header":1024068659,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"voter","type":{"kind":"simple","type":"address","optional":false}},{"name":"voting","type":{"kind":"simple","type":"address","optional":false}},{"name":"optionAddress","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"RelayCreateVotingReq","header":1024068660,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"dao","type":{"kind":"simple","type":"address","optional":false}},{"name":"initiator","type":{"kind":"simple","type":"address","optional":false}},{"name":"metadata","type":{"kind":"simple","type":"cell","optional":false}},{"name":"settings","type":{"kind":"simple","type":"VoteSettings","optional":false}},{"name":"action","type":{"kind":"simple","type":"DaoAction","optional":false}}]},
    {"name":"RelayVotingAddOptionReq","header":1024068661,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"dao","type":{"kind":"simple","type":"address","optional":false}},{"name":"voting","type":{"kind":"simple","type":"address","optional":false}},{"name":"title","type":{"kind":"simple","type":"string","optional":false}},{"name":"description","type":{"kind":"simple","type":"string","optional":false}}]},
    {"name":"RelayVotingStartReq","header":1024068662,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"dao","type":{"kind":"simple","type":"address","optional":false}},{"name":"voting","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"RelayWeightCastReq","header":1024068663,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"dao","type":{"kind":"simple","type":"address","optional":false}},{"name":"voter","type":{"kind":"simple","type":"address","optional":false}},{"name":"voting","type":{"kind":"simple","type":"address","optional":false}},{"name":"optionAddress","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"RegisterVoting","header":1024068644,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"voting","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"VotingStarted","header":1024068645,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"endTime","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"AddWeight","header":1024068624,"fields":[{"name":"voter","type":{"kind":"simple","type":"address","optional":false}},{"name":"optionAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"weight","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"TokenInfo","header":null,"fields":[{"name":"jetton_master","type":{"kind":"simple","type":"address","optional":false}},{"name":"jetton_fee","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"admin","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"DaoToken","header":null,"fields":[{"name":"jetton_wallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"dao_fee","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"OptionInfo","header":null,"fields":[{"name":"title","type":{"kind":"simple","type":"string","optional":false}},{"name":"description","type":{"kind":"simple","type":"string","optional":false}}]},
    {"name":"OptionInfoRoot","header":null,"fields":[{"name":"address","type":{"kind":"simple","type":"address","optional":false}},{"name":"title","type":{"kind":"simple","type":"string","optional":false}},{"name":"description","type":{"kind":"simple","type":"string","optional":false}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"VoteSettings","header":null,"fields":[{"name":"endTime","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"min_amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"quorum","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"supportPct","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"turnoutPct","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"totalSupply","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"StartNewVotingStruct","header":null,"fields":[{"name":"metadata","type":{"kind":"simple","type":"cell","optional":false}},{"name":"settings","type":{"kind":"simple","type":"VoteSettings","optional":false}}]},
    {"name":"StartNewVotingTestStruct","header":null,"fields":[{"name":"endTime","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"min_amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"fee","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"TakeDAOVoteStruct","header":null,"fields":[{"name":"adminAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"optionAddress","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"WinnerInfo","header":null,"fields":[{"name":"address","type":{"kind":"simple","type":"address","optional":true}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"total","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"finished","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"DaoConfig","header":null,"fields":[{"name":"voteJettonMaster","type":{"kind":"simple","type":"address","optional":false}},{"name":"minProposal","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"minQuorum","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"minSupportPct","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"minTurnoutPct","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"minDuration","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"logo","type":{"kind":"simple","type":"cell","optional":false}},{"name":"voteJettonWallet","type":{"kind":"simple","type":"address","optional":true}}]},
    {"name":"DaoParam","header":null,"fields":[{"name":"key","type":{"kind":"simple","type":"string","optional":false}},{"name":"isString","type":{"kind":"simple","type":"bool","optional":false}},{"name":"num","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"str","type":{"kind":"simple","type":"string","optional":false}}]},
    {"name":"DaoAction","header":null,"fields":[{"name":"kind","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"treasuryWallet","type":{"kind":"simple","type":"address","optional":true}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"destination","type":{"kind":"simple","type":"address","optional":true}},{"name":"newConfig","type":{"kind":"simple","type":"DaoConfig","optional":true}},{"name":"approveOption","type":{"kind":"simple","type":"address","optional":true}},{"name":"newCode","type":{"kind":"simple","type":"cell","optional":true}},{"name":"param","type":{"kind":"simple","type":"DaoParam","optional":true}}]},
    {"name":"SliceBitsAndRefs","header":null,"fields":[{"name":"bits","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"refs","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"JettonMinterState","header":null,"fields":[{"name":"totalSupply","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"mintable","type":{"kind":"simple","type":"bool","optional":false}},{"name":"adminAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"jettonContent","type":{"kind":"simple","type":"cell","optional":false}},{"name":"jettonWalletCode","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"GovernanceJettonMinter$Data","header":null,"fields":[{"name":"totalSupply","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"adminAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"nextAdminAddress","type":{"kind":"simple","type":"address","optional":true}},{"name":"jettonContent","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"JettonWalletGovernance$Data","header":null,"fields":[{"name":"status","type":{"kind":"simple","type":"uint","optional":false,"format":4}},{"name":"balance","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"master","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"JettonData","header":null,"fields":[{"name":"totalSupply","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"mintable","type":{"kind":"simple","type":"bool","optional":false}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"content","type":{"kind":"simple","type":"cell","optional":false}},{"name":"jettonWalletCode","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"JettonWalletData","header":null,"fields":[{"name":"balance","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"minter","type":{"kind":"simple","type":"address","optional":false}},{"name":"code","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"MaybeAddress","header":null,"fields":[{"name":"address","type":{"kind":"simple","type":"address","optional":true}}]},
    {"name":"JettonTransfer","header":260734629,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"destination","type":{"kind":"simple","type":"address","optional":false}},{"name":"responseDestination","type":{"kind":"simple","type":"address","optional":true}},{"name":"customPayload","type":{"kind":"simple","type":"cell","optional":true}},{"name":"forwardTonAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"forwardPayload","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"JettonBurn","header":1499400124,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"responseDestination","type":{"kind":"simple","type":"address","optional":true}},{"name":"customPayload","type":{"kind":"simple","type":"cell","optional":true}}]},
    {"name":"JettonNotification","header":1935855772,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"forwardPayload","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"JettonExcesses","header":3576854235,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"JettonTransferInternal","header":395134233,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"responseDestination","type":{"kind":"simple","type":"address","optional":true}},{"name":"forwardTonAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"forwardPayload","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"JettonBurnNotification","header":2078119902,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"responseDestination","type":{"kind":"simple","type":"address","optional":true}}]},
    {"name":"ProvideWalletAddress","header":745978227,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"ownerAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"includeAddress","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"TakeWalletAddress","header":3513996288,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"walletAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"ownerAddress","type":{"kind":"simple","type":"cell","optional":true}}]},
    {"name":"TopUp","header":3547469196,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"SetStatus","header":4006754003,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"status","type":{"kind":"simple","type":"uint","optional":false,"format":4}}]},
    {"name":"Mint","header":1680571655,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"toAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"masterMsg","type":{"kind":"simple","type":"JettonTransferInternal","optional":false}}]},
    {"name":"ChangeAdmin","header":1694626644,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newAdminAddress","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ClaimAdmin","header":4220051737,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"CallTo","header":593276754,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"toAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"tonAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"masterMsg","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"Upgrade","header":621336170,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newData","type":{"kind":"simple","type":"cell","optional":false}},{"name":"newCode","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"ChangeMetadataUri","header":3414567170,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"metadata","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"ProvideWalletBalance","header":2059982169,"fields":[{"name":"receiver","type":{"kind":"simple","type":"address","optional":false}},{"name":"includeVerifyInfo","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"VerifyInfo","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"minter","type":{"kind":"simple","type":"address","optional":false}},{"name":"code","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"TakeWalletBalance","header":3396861378,"fields":[{"name":"balance","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"verifyInfo","type":{"kind":"simple","type":"VerifyInfo","optional":true}}]},
    {"name":"ContractVaultDAOv1$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"status","type":{"kind":"simple","type":"uint","optional":false,"format":4}},{"name":"data","type":{"kind":"simple","type":"OptionInfo","optional":false}}]},
    {"name":"ContractLightVotingV1$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"admin","type":{"kind":"simple","type":"address","optional":false}},{"name":"wallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"seqno","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"status","type":{"kind":"simple","type":"uint","optional":false,"format":4}},{"name":"metadata","type":{"kind":"simple","type":"cell","optional":false}},{"name":"settings","type":{"kind":"simple","type":"VoteSettings","optional":false}},{"name":"options","type":{"kind":"dict","key":"address","value":"OptionInfoRoot","valueFormat":"ref"}},{"name":"winner","type":{"kind":"simple","type":"WinnerInfo","optional":false}},{"name":"voted","type":{"kind":"dict","key":"address","value":"bool"}},{"name":"stakes","type":{"kind":"dict","key":"address","value":"uint","valueFormat":"coins"}},{"name":"weightSource","type":{"kind":"simple","type":"address","optional":true}}]},
]

const ContractLightVotingV1_opcodes = {
    "DoMigrate": 1024068618,
    "DAOvote": 1475729905,
    "WhiteList": 3714265888,
    "DropCollection": 2783320816,
    "ChangeAdminCitizen": 11,
    "ChangeOwnerDAO": 7,
    "GetFunds": 8,
    "AddAdmin": 9,
    "RemoveAdmin": 10,
    "ChangeTreasury": 12,
    "JettonTransferNotification": 1935855772,
    "StartNewVoting": 3100530816,
    "StartDAOVoting": 718541994,
    "InitVoting": 1440328515,
    "ActivateVote": 690358848,
    "CallVote": 435109211,
    "GiveVote": 3041426889,
    "TakeVote": 3958568142,
    "TakeDAOVote": 3914228146,
    "PassPassport": 57069,
    "SetToken": 3233865037,
    "AddOption": 3367105963,
    "VaultInitialization": 3683237002,
    "VirtualInitialization": 226213212,
    "SubmitVoting": 4022960818,
    "CancelVoting": 502754399,
    "ProvideAction": 385206731,
    "ProvideActionDAO": 1847741543,
    "ProvideVoting": 943290294,
    "PassportControl": 3735928559,
    "CreateDao": 1024068608,
    "InitDaoWallet": 1024068609,
    "CreateVotingReq": 1024068610,
    "VotingFinished": 1024068611,
    "SetVerified": 1024068612,
    "MarkDao": 1024068613,
    "UpgradeCode": 1024068614,
    "BindJettonWallet": 1024068640,
    "SetFactoryToken": 1024068641,
    "BindChildWallet": 1024068642,
    "InitDao": 1024068643,
    "RelayCreateVoting": 1024068656,
    "RelayVotingAddOption": 1024068657,
    "RelayVotingStart": 1024068658,
    "RelayWeightCast": 1024068659,
    "RelayCreateVotingReq": 1024068660,
    "RelayVotingAddOptionReq": 1024068661,
    "RelayVotingStartReq": 1024068662,
    "RelayWeightCastReq": 1024068663,
    "RegisterVoting": 1024068644,
    "VotingStarted": 1024068645,
    "AddWeight": 1024068624,
    "JettonTransfer": 260734629,
    "JettonBurn": 1499400124,
    "JettonNotification": 1935855772,
    "JettonExcesses": 3576854235,
    "JettonTransferInternal": 395134233,
    "JettonBurnNotification": 2078119902,
    "ProvideWalletAddress": 745978227,
    "TakeWalletAddress": 3513996288,
    "TopUp": 3547469196,
    "SetStatus": 4006754003,
    "Mint": 1680571655,
    "ChangeAdmin": 1694626644,
    "ClaimAdmin": 4220051737,
    "CallTo": 593276754,
    "Upgrade": 621336170,
    "ChangeMetadataUri": 3414567170,
    "ProvideWalletBalance": 2059982169,
    "TakeWalletBalance": 3396861378,
}

const ContractLightVotingV1_getters: ABIGetter[] = [
    {"name":"get_options","methodId":129062,"arguments":[],"returnType":{"kind":"dict","key":"address","value":"OptionInfoRoot","valueFormat":"ref"}},
    {"name":"get_metadata","methodId":89214,"arguments":[],"returnType":{"kind":"simple","type":"cell","optional":false}},
    {"name":"get_settings","methodId":108850,"arguments":[],"returnType":{"kind":"simple","type":"VoteSettings","optional":false}},
    {"name":"get_status","methodId":100881,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_results","methodId":129659,"arguments":[],"returnType":{"kind":"simple","type":"WinnerInfo","optional":false}},
    {"name":"get_voted","methodId":130482,"arguments":[{"name":"voter","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"get_stake","methodId":82144,"arguments":[{"name":"voter","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_seqno","methodId":77871,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_version","methodId":82320,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_release","methodId":76110,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
]

export const ContractLightVotingV1_getterMapping: { [key: string]: string } = {
    'get_options': 'getGetOptions',
    'get_metadata': 'getGetMetadata',
    'get_settings': 'getGetSettings',
    'get_status': 'getGetStatus',
    'get_results': 'getGetResults',
    'get_voted': 'getGetVoted',
    'get_stake': 'getGetStake',
    'get_seqno': 'getGetSeqno',
    'get_version': 'getGetVersion',
    'get_release': 'getGetRelease',
}

const ContractLightVotingV1_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"text","text":"init"}},
    {"receiver":"internal","message":{"kind":"typed","type":"JettonNotification"}},
    {"receiver":"internal","message":{"kind":"typed","type":"AddOption"}},
    {"receiver":"internal","message":{"kind":"typed","type":"AddWeight"}},
    {"receiver":"internal","message":{"kind":"text","text":"start"}},
    {"receiver":"internal","message":{"kind":"text","text":"finalize"}},
    {"receiver":"internal","message":{"kind":"typed","type":"TakeVote"}},
    {"receiver":"internal","message":{"kind":"empty"}},
]

export const Workchain = 0n;
export const MyWorkchain = false;
export const minTonsForStorage = 10000000n;
export const gasForTransfer = 10200n;
export const gasForBurn = 7500n;
export const walletStateInitCells = 30n;
export const walletStateInitBits = 20000n;

export class ContractLightVotingV1 implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = ContractLightVotingV1_errors_backward;
    public static readonly opcodes = ContractLightVotingV1_opcodes;
    
    static async init(owner: Address, admin: Address, wallet: Address, seqno: bigint, status: bigint, metadata: Cell, settings: VoteSettings, options: Dictionary<Address, OptionInfoRoot>, winner: WinnerInfo, voted: Dictionary<Address, boolean>, stakes: Dictionary<Address, bigint>, weightSource: Address | null) {
        return await ContractLightVotingV1_init(owner, admin, wallet, seqno, status, metadata, settings, options, winner, voted, stakes, weightSource);
    }
    
    static async fromInit(owner: Address, admin: Address, wallet: Address, seqno: bigint, status: bigint, metadata: Cell, settings: VoteSettings, options: Dictionary<Address, OptionInfoRoot>, winner: WinnerInfo, voted: Dictionary<Address, boolean>, stakes: Dictionary<Address, bigint>, weightSource: Address | null) {
        const __gen_init = await ContractLightVotingV1_init(owner, admin, wallet, seqno, status, metadata, settings, options, winner, voted, stakes, weightSource);
        const address = contractAddress(0, __gen_init);
        return new ContractLightVotingV1(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new ContractLightVotingV1(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  ContractLightVotingV1_types,
        getters: ContractLightVotingV1_getters,
        receivers: ContractLightVotingV1_receivers,
        errors: ContractLightVotingV1_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: "init" | JettonNotification | AddOption | AddWeight | "start" | "finalize" | TakeVote | null) {
        
        let body: Cell | null = null;
        if (message === "init") {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'JettonNotification') {
            body = beginCell().store(storeJettonNotification(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'AddOption') {
            body = beginCell().store(storeAddOption(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'AddWeight') {
            body = beginCell().store(storeAddWeight(message)).endCell();
        }
        if (message === "start") {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message === "finalize") {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'TakeVote') {
            body = beginCell().store(storeTakeVote(message)).endCell();
        }
        if (message === null) {
            body = new Cell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getGetOptions(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_options', builder.build())).stack;
        const result = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserOptionInfoRoot(), source.readCellOpt());
        return result;
    }
    
    async getGetMetadata(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_metadata', builder.build())).stack;
        const result = source.readCell();
        return result;
    }
    
    async getGetSettings(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_settings', builder.build())).stack;
        const result = loadGetterTupleVoteSettings(source);
        return result;
    }
    
    async getGetStatus(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_status', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetResults(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_results', builder.build())).stack;
        const result = loadGetterTupleWinnerInfo(source);
        return result;
    }
    
    async getGetVoted(provider: ContractProvider, voter: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(voter);
        const source = (await provider.get('get_voted', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
    async getGetStake(provider: ContractProvider, voter: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(voter);
        const source = (await provider.get('get_stake', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetSeqno(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_seqno', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetVersion(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_version', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetRelease(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_release', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
}