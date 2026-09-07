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

export type StakeVote = {
    $$type: 'StakeVote';
    queryId: bigint;
    voting: Address;
    optionAddress: Address;
    endTime: bigint;
}

export function storeStakeVote(src: StakeVote) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1524301825, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.voting);
        b_0.storeAddress(src.optionAddress);
        b_0.storeUint(src.endTime, 64);
    };
}

export function loadStakeVote(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1524301825) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _voting = sc_0.loadAddress();
    const _optionAddress = sc_0.loadAddress();
    const _endTime = sc_0.loadUintBig(64);
    return { $$type: 'StakeVote' as const, queryId: _queryId, voting: _voting, optionAddress: _optionAddress, endTime: _endTime };
}

export function loadTupleStakeVote(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _voting = source.readAddress();
    const _optionAddress = source.readAddress();
    const _endTime = source.readBigNumber();
    return { $$type: 'StakeVote' as const, queryId: _queryId, voting: _voting, optionAddress: _optionAddress, endTime: _endTime };
}

export function loadGetterTupleStakeVote(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _voting = source.readAddress();
    const _optionAddress = source.readAddress();
    const _endTime = source.readBigNumber();
    return { $$type: 'StakeVote' as const, queryId: _queryId, voting: _voting, optionAddress: _optionAddress, endTime: _endTime };
}

export function storeTupleStakeVote(source: StakeVote) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.voting);
    builder.writeAddress(source.optionAddress);
    builder.writeNumber(source.endTime);
    return builder.build();
}

export function dictValueParserStakeVote(): DictionaryValue<StakeVote> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStakeVote(src)).endCell());
        },
        parse: (src) => {
            return loadStakeVote(src.loadRef().beginParse());
        }
    }
}

export type StakeSrcUnstake = {
    $$type: 'StakeSrcUnstake';
    queryId: bigint;
    amount: bigint;
}

export function storeStakeSrcUnstake(src: StakeSrcUnstake) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1524301826, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeCoins(src.amount);
    };
}

export function loadStakeSrcUnstake(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1524301826) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _amount = sc_0.loadCoins();
    return { $$type: 'StakeSrcUnstake' as const, queryId: _queryId, amount: _amount };
}

export function loadTupleStakeSrcUnstake(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    return { $$type: 'StakeSrcUnstake' as const, queryId: _queryId, amount: _amount };
}

export function loadGetterTupleStakeSrcUnstake(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    return { $$type: 'StakeSrcUnstake' as const, queryId: _queryId, amount: _amount };
}

export function storeTupleStakeSrcUnstake(source: StakeSrcUnstake) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.amount);
    return builder.build();
}

export function dictValueParserStakeSrcUnstake(): DictionaryValue<StakeSrcUnstake> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStakeSrcUnstake(src)).endCell());
        },
        parse: (src) => {
            return loadStakeSrcUnstake(src.loadRef().beginParse());
        }
    }
}

export type RelayStakeVote = {
    $$type: 'RelayStakeVote';
    queryId: bigint;
    voter: Address;
    voting: Address;
    optionAddress: Address;
}

export function storeRelayStakeVote(src: RelayStakeVote) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1524301827, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.voter);
        b_0.storeAddress(src.voting);
        b_0.storeAddress(src.optionAddress);
    };
}

export function loadRelayStakeVote(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1524301827) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _voter = sc_0.loadAddress();
    const _voting = sc_0.loadAddress();
    const _optionAddress = sc_0.loadAddress();
    return { $$type: 'RelayStakeVote' as const, queryId: _queryId, voter: _voter, voting: _voting, optionAddress: _optionAddress };
}

export function loadTupleRelayStakeVote(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _voter = source.readAddress();
    const _voting = source.readAddress();
    const _optionAddress = source.readAddress();
    return { $$type: 'RelayStakeVote' as const, queryId: _queryId, voter: _voter, voting: _voting, optionAddress: _optionAddress };
}

export function loadGetterTupleRelayStakeVote(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _voter = source.readAddress();
    const _voting = source.readAddress();
    const _optionAddress = source.readAddress();
    return { $$type: 'RelayStakeVote' as const, queryId: _queryId, voter: _voter, voting: _voting, optionAddress: _optionAddress };
}

export function storeTupleRelayStakeVote(source: RelayStakeVote) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.voter);
    builder.writeAddress(source.voting);
    builder.writeAddress(source.optionAddress);
    return builder.build();
}

export function dictValueParserRelayStakeVote(): DictionaryValue<RelayStakeVote> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRelayStakeVote(src)).endCell());
        },
        parse: (src) => {
            return loadRelayStakeVote(src.loadRef().beginParse());
        }
    }
}

export type ContractStakeSource$Data = {
    $$type: 'ContractStakeSource$Data';
    owner: Address;
    voteJettonMaster: Address;
    wallet: Address | null;
    totalStake: bigint;
    stakes: Dictionary<Address, bigint>;
    lockUntil: Dictionary<Address, bigint>;
    voted: Dictionary<bigint, boolean>;
    votings: Dictionary<Address, bigint>;
}

export function storeContractStakeSource$Data(src: ContractStakeSource$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.voteJettonMaster);
        b_0.storeAddress(src.wallet);
        b_0.storeCoins(src.totalStake);
        b_0.storeDict(src.stakes, Dictionary.Keys.Address(), Dictionary.Values.BigVarUint(4));
        b_0.storeDict(src.lockUntil, Dictionary.Keys.Address(), Dictionary.Values.BigUint(64));
        const b_1 = new Builder();
        b_1.storeDict(src.voted, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool());
        b_1.storeDict(src.votings, Dictionary.Keys.Address(), Dictionary.Values.BigUint(64));
        b_0.storeRef(b_1.endCell());
    };
}

export function loadContractStakeSource$Data(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _voteJettonMaster = sc_0.loadAddress();
    const _wallet = sc_0.loadMaybeAddress();
    const _totalStake = sc_0.loadCoins();
    const _stakes = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigVarUint(4), sc_0);
    const _lockUntil = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigUint(64), sc_0);
    const sc_1 = sc_0.loadRef().beginParse();
    const _voted = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), sc_1);
    const _votings = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigUint(64), sc_1);
    return { $$type: 'ContractStakeSource$Data' as const, owner: _owner, voteJettonMaster: _voteJettonMaster, wallet: _wallet, totalStake: _totalStake, stakes: _stakes, lockUntil: _lockUntil, voted: _voted, votings: _votings };
}

export function loadTupleContractStakeSource$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _voteJettonMaster = source.readAddress();
    const _wallet = source.readAddressOpt();
    const _totalStake = source.readBigNumber();
    const _stakes = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigVarUint(4), source.readCellOpt());
    const _lockUntil = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigUint(64), source.readCellOpt());
    const _voted = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    const _votings = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigUint(64), source.readCellOpt());
    return { $$type: 'ContractStakeSource$Data' as const, owner: _owner, voteJettonMaster: _voteJettonMaster, wallet: _wallet, totalStake: _totalStake, stakes: _stakes, lockUntil: _lockUntil, voted: _voted, votings: _votings };
}

export function loadGetterTupleContractStakeSource$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _voteJettonMaster = source.readAddress();
    const _wallet = source.readAddressOpt();
    const _totalStake = source.readBigNumber();
    const _stakes = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigVarUint(4), source.readCellOpt());
    const _lockUntil = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigUint(64), source.readCellOpt());
    const _voted = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    const _votings = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigUint(64), source.readCellOpt());
    return { $$type: 'ContractStakeSource$Data' as const, owner: _owner, voteJettonMaster: _voteJettonMaster, wallet: _wallet, totalStake: _totalStake, stakes: _stakes, lockUntil: _lockUntil, voted: _voted, votings: _votings };
}

export function storeTupleContractStakeSource$Data(source: ContractStakeSource$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeAddress(source.voteJettonMaster);
    builder.writeAddress(source.wallet);
    builder.writeNumber(source.totalStake);
    builder.writeCell(source.stakes.size > 0 ? beginCell().storeDictDirect(source.stakes, Dictionary.Keys.Address(), Dictionary.Values.BigVarUint(4)).endCell() : null);
    builder.writeCell(source.lockUntil.size > 0 ? beginCell().storeDictDirect(source.lockUntil, Dictionary.Keys.Address(), Dictionary.Values.BigUint(64)).endCell() : null);
    builder.writeCell(source.voted.size > 0 ? beginCell().storeDictDirect(source.voted, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool()).endCell() : null);
    builder.writeCell(source.votings.size > 0 ? beginCell().storeDictDirect(source.votings, Dictionary.Keys.Address(), Dictionary.Values.BigUint(64)).endCell() : null);
    return builder.build();
}

export function dictValueParserContractStakeSource$Data(): DictionaryValue<ContractStakeSource$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContractStakeSource$Data(src)).endCell());
        },
        parse: (src) => {
            return loadContractStakeSource$Data(src.loadRef().beginParse());
        }
    }
}

export type CreateCivicDao = {
    $$type: 'CreateCivicDao';
    queryId: bigint;
    metadata: Cell;
    config: DaoConfig;
    params: Dictionary<bigint, DaoParam>;
}

export function storeCreateCivicDao(src: CreateCivicDao) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1524367367, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeRef(src.metadata);
        b_0.store(storeDaoConfig(src.config));
        b_0.storeDict(src.params, Dictionary.Keys.BigInt(257), dictValueParserDaoParam());
    };
}

export function loadCreateCivicDao(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1524367367) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _metadata = sc_0.loadRef();
    const _config = loadDaoConfig(sc_0);
    const _params = Dictionary.load(Dictionary.Keys.BigInt(257), dictValueParserDaoParam(), sc_0);
    return { $$type: 'CreateCivicDao' as const, queryId: _queryId, metadata: _metadata, config: _config, params: _params };
}

export function loadTupleCreateCivicDao(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _metadata = source.readCell();
    const _config = loadTupleDaoConfig(source);
    const _params = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserDaoParam(), source.readCellOpt());
    return { $$type: 'CreateCivicDao' as const, queryId: _queryId, metadata: _metadata, config: _config, params: _params };
}

export function loadGetterTupleCreateCivicDao(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _metadata = source.readCell();
    const _config = loadGetterTupleDaoConfig(source);
    const _params = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserDaoParam(), source.readCellOpt());
    return { $$type: 'CreateCivicDao' as const, queryId: _queryId, metadata: _metadata, config: _config, params: _params };
}

export function storeTupleCreateCivicDao(source: CreateCivicDao) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeCell(source.metadata);
    builder.writeTuple(storeTupleDaoConfig(source.config));
    builder.writeCell(source.params.size > 0 ? beginCell().storeDictDirect(source.params, Dictionary.Keys.BigInt(257), dictValueParserDaoParam()).endCell() : null);
    return builder.build();
}

export function dictValueParserCreateCivicDao(): DictionaryValue<CreateCivicDao> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeCreateCivicDao(src)).endCell());
        },
        parse: (src) => {
            return loadCreateCivicDao(src.loadRef().beginParse());
        }
    }
}

export type RelayCivicGrant = {
    $$type: 'RelayCivicGrant';
    queryId: bigint;
    civicSource: Address;
    voter: Address;
    voting: Address;
    expires: bigint;
    nullifier: bigint;
    weight: bigint;
}

export function storeRelayCivicGrant(src: RelayCivicGrant) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1524367368, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.civicSource);
        b_0.storeAddress(src.voter);
        b_0.storeAddress(src.voting);
        b_0.storeUint(src.expires, 64);
        const b_1 = new Builder();
        b_1.storeUint(src.nullifier, 256);
        b_1.storeCoins(src.weight);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadRelayCivicGrant(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1524367368) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _civicSource = sc_0.loadAddress();
    const _voter = sc_0.loadAddress();
    const _voting = sc_0.loadAddress();
    const _expires = sc_0.loadUintBig(64);
    const sc_1 = sc_0.loadRef().beginParse();
    const _nullifier = sc_1.loadUintBig(256);
    const _weight = sc_1.loadCoins();
    return { $$type: 'RelayCivicGrant' as const, queryId: _queryId, civicSource: _civicSource, voter: _voter, voting: _voting, expires: _expires, nullifier: _nullifier, weight: _weight };
}

export function loadTupleRelayCivicGrant(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _civicSource = source.readAddress();
    const _voter = source.readAddress();
    const _voting = source.readAddress();
    const _expires = source.readBigNumber();
    const _nullifier = source.readBigNumber();
    const _weight = source.readBigNumber();
    return { $$type: 'RelayCivicGrant' as const, queryId: _queryId, civicSource: _civicSource, voter: _voter, voting: _voting, expires: _expires, nullifier: _nullifier, weight: _weight };
}

export function loadGetterTupleRelayCivicGrant(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _civicSource = source.readAddress();
    const _voter = source.readAddress();
    const _voting = source.readAddress();
    const _expires = source.readBigNumber();
    const _nullifier = source.readBigNumber();
    const _weight = source.readBigNumber();
    return { $$type: 'RelayCivicGrant' as const, queryId: _queryId, civicSource: _civicSource, voter: _voter, voting: _voting, expires: _expires, nullifier: _nullifier, weight: _weight };
}

export function storeTupleRelayCivicGrant(source: RelayCivicGrant) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.civicSource);
    builder.writeAddress(source.voter);
    builder.writeAddress(source.voting);
    builder.writeNumber(source.expires);
    builder.writeNumber(source.nullifier);
    builder.writeNumber(source.weight);
    return builder.build();
}

export function dictValueParserRelayCivicGrant(): DictionaryValue<RelayCivicGrant> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRelayCivicGrant(src)).endCell());
        },
        parse: (src) => {
            return loadRelayCivicGrant(src.loadRef().beginParse());
        }
    }
}

export type GrantCivicVote = {
    $$type: 'GrantCivicVote';
    queryId: bigint;
    voter: Address;
    voting: Address;
    expires: bigint;
    nullifier: bigint;
    weight: bigint;
}

export function storeGrantCivicVote(src: GrantCivicVote) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1524367361, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.voter);
        b_0.storeAddress(src.voting);
        b_0.storeUint(src.expires, 64);
        b_0.storeUint(src.nullifier, 256);
        const b_1 = new Builder();
        b_1.storeCoins(src.weight);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadGrantCivicVote(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1524367361) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _voter = sc_0.loadAddress();
    const _voting = sc_0.loadAddress();
    const _expires = sc_0.loadUintBig(64);
    const _nullifier = sc_0.loadUintBig(256);
    const sc_1 = sc_0.loadRef().beginParse();
    const _weight = sc_1.loadCoins();
    return { $$type: 'GrantCivicVote' as const, queryId: _queryId, voter: _voter, voting: _voting, expires: _expires, nullifier: _nullifier, weight: _weight };
}

export function loadTupleGrantCivicVote(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _voter = source.readAddress();
    const _voting = source.readAddress();
    const _expires = source.readBigNumber();
    const _nullifier = source.readBigNumber();
    const _weight = source.readBigNumber();
    return { $$type: 'GrantCivicVote' as const, queryId: _queryId, voter: _voter, voting: _voting, expires: _expires, nullifier: _nullifier, weight: _weight };
}

export function loadGetterTupleGrantCivicVote(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _voter = source.readAddress();
    const _voting = source.readAddress();
    const _expires = source.readBigNumber();
    const _nullifier = source.readBigNumber();
    const _weight = source.readBigNumber();
    return { $$type: 'GrantCivicVote' as const, queryId: _queryId, voter: _voter, voting: _voting, expires: _expires, nullifier: _nullifier, weight: _weight };
}

export function storeTupleGrantCivicVote(source: GrantCivicVote) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.voter);
    builder.writeAddress(source.voting);
    builder.writeNumber(source.expires);
    builder.writeNumber(source.nullifier);
    builder.writeNumber(source.weight);
    return builder.build();
}

export function dictValueParserGrantCivicVote(): DictionaryValue<GrantCivicVote> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeGrantCivicVote(src)).endCell());
        },
        parse: (src) => {
            return loadGrantCivicVote(src.loadRef().beginParse());
        }
    }
}

export type CivicCast = {
    $$type: 'CivicCast';
    queryId: bigint;
    voting: Address;
    optionAddress: Address;
}

export function storeCivicCast(src: CivicCast) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1524367362, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.voting);
        b_0.storeAddress(src.optionAddress);
    };
}

export function loadCivicCast(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1524367362) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _voting = sc_0.loadAddress();
    const _optionAddress = sc_0.loadAddress();
    return { $$type: 'CivicCast' as const, queryId: _queryId, voting: _voting, optionAddress: _optionAddress };
}

export function loadTupleCivicCast(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _voting = source.readAddress();
    const _optionAddress = source.readAddress();
    return { $$type: 'CivicCast' as const, queryId: _queryId, voting: _voting, optionAddress: _optionAddress };
}

export function loadGetterTupleCivicCast(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _voting = source.readAddress();
    const _optionAddress = source.readAddress();
    return { $$type: 'CivicCast' as const, queryId: _queryId, voting: _voting, optionAddress: _optionAddress };
}

export function storeTupleCivicCast(source: CivicCast) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.voting);
    builder.writeAddress(source.optionAddress);
    return builder.build();
}

export function dictValueParserCivicCast(): DictionaryValue<CivicCast> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeCivicCast(src)).endCell());
        },
        parse: (src) => {
            return loadCivicCast(src.loadRef().beginParse());
        }
    }
}

export type RelayCivicCast = {
    $$type: 'RelayCivicCast';
    queryId: bigint;
    voter: Address;
    voting: Address;
    optionAddress: Address;
}

export function storeRelayCivicCast(src: RelayCivicCast) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1524367363, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.voter);
        b_0.storeAddress(src.voting);
        b_0.storeAddress(src.optionAddress);
    };
}

export function loadRelayCivicCast(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1524367363) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _voter = sc_0.loadAddress();
    const _voting = sc_0.loadAddress();
    const _optionAddress = sc_0.loadAddress();
    return { $$type: 'RelayCivicCast' as const, queryId: _queryId, voter: _voter, voting: _voting, optionAddress: _optionAddress };
}

export function loadTupleRelayCivicCast(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _voter = source.readAddress();
    const _voting = source.readAddress();
    const _optionAddress = source.readAddress();
    return { $$type: 'RelayCivicCast' as const, queryId: _queryId, voter: _voter, voting: _voting, optionAddress: _optionAddress };
}

export function loadGetterTupleRelayCivicCast(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _voter = source.readAddress();
    const _voting = source.readAddress();
    const _optionAddress = source.readAddress();
    return { $$type: 'RelayCivicCast' as const, queryId: _queryId, voter: _voter, voting: _voting, optionAddress: _optionAddress };
}

export function storeTupleRelayCivicCast(source: RelayCivicCast) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.voter);
    builder.writeAddress(source.voting);
    builder.writeAddress(source.optionAddress);
    return builder.build();
}

export function dictValueParserRelayCivicCast(): DictionaryValue<RelayCivicCast> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRelayCivicCast(src)).endCell());
        },
        parse: (src) => {
            return loadRelayCivicCast(src.loadRef().beginParse());
        }
    }
}

export type RelayCivicCastReq = {
    $$type: 'RelayCivicCastReq';
    queryId: bigint;
    civicSource: Address;
    voter: Address;
    voting: Address;
    optionAddress: Address;
}

export function storeRelayCivicCastReq(src: RelayCivicCastReq) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1524367369, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.civicSource);
        b_0.storeAddress(src.voter);
        b_0.storeAddress(src.voting);
        const b_1 = new Builder();
        b_1.storeAddress(src.optionAddress);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadRelayCivicCastReq(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1524367369) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _civicSource = sc_0.loadAddress();
    const _voter = sc_0.loadAddress();
    const _voting = sc_0.loadAddress();
    const sc_1 = sc_0.loadRef().beginParse();
    const _optionAddress = sc_1.loadAddress();
    return { $$type: 'RelayCivicCastReq' as const, queryId: _queryId, civicSource: _civicSource, voter: _voter, voting: _voting, optionAddress: _optionAddress };
}

export function loadTupleRelayCivicCastReq(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _civicSource = source.readAddress();
    const _voter = source.readAddress();
    const _voting = source.readAddress();
    const _optionAddress = source.readAddress();
    return { $$type: 'RelayCivicCastReq' as const, queryId: _queryId, civicSource: _civicSource, voter: _voter, voting: _voting, optionAddress: _optionAddress };
}

export function loadGetterTupleRelayCivicCastReq(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _civicSource = source.readAddress();
    const _voter = source.readAddress();
    const _voting = source.readAddress();
    const _optionAddress = source.readAddress();
    return { $$type: 'RelayCivicCastReq' as const, queryId: _queryId, civicSource: _civicSource, voter: _voter, voting: _voting, optionAddress: _optionAddress };
}

export function storeTupleRelayCivicCastReq(source: RelayCivicCastReq) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.civicSource);
    builder.writeAddress(source.voter);
    builder.writeAddress(source.voting);
    builder.writeAddress(source.optionAddress);
    return builder.build();
}

export function dictValueParserRelayCivicCastReq(): DictionaryValue<RelayCivicCastReq> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRelayCivicCastReq(src)).endCell());
        },
        parse: (src) => {
            return loadRelayCivicCastReq(src.loadRef().beginParse());
        }
    }
}

export type ContractCivicSource$Data = {
    $$type: 'ContractCivicSource$Data';
    owner: Address;
    verifier: Address;
    grants: Dictionary<bigint, bigint>;
    grantWeights: Dictionary<bigint, bigint>;
    voted: Dictionary<bigint, boolean>;
    nullifiers: Dictionary<bigint, boolean>;
}

export function storeContractCivicSource$Data(src: ContractCivicSource$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.verifier);
        b_0.storeDict(src.grants, Dictionary.Keys.BigInt(257), Dictionary.Values.BigUint(64));
        b_0.storeDict(src.grantWeights, Dictionary.Keys.BigInt(257), Dictionary.Values.BigVarUint(4));
        const b_1 = new Builder();
        b_1.storeDict(src.voted, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool());
        b_1.storeDict(src.nullifiers, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadContractCivicSource$Data(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _verifier = sc_0.loadAddress();
    const _grants = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.BigUint(64), sc_0);
    const _grantWeights = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.BigVarUint(4), sc_0);
    const sc_1 = sc_0.loadRef().beginParse();
    const _voted = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), sc_1);
    const _nullifiers = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), sc_1);
    return { $$type: 'ContractCivicSource$Data' as const, owner: _owner, verifier: _verifier, grants: _grants, grantWeights: _grantWeights, voted: _voted, nullifiers: _nullifiers };
}

export function loadTupleContractCivicSource$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _verifier = source.readAddress();
    const _grants = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigUint(64), source.readCellOpt());
    const _grantWeights = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigVarUint(4), source.readCellOpt());
    const _voted = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    const _nullifiers = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    return { $$type: 'ContractCivicSource$Data' as const, owner: _owner, verifier: _verifier, grants: _grants, grantWeights: _grantWeights, voted: _voted, nullifiers: _nullifiers };
}

export function loadGetterTupleContractCivicSource$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _verifier = source.readAddress();
    const _grants = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigUint(64), source.readCellOpt());
    const _grantWeights = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigVarUint(4), source.readCellOpt());
    const _voted = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    const _nullifiers = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    return { $$type: 'ContractCivicSource$Data' as const, owner: _owner, verifier: _verifier, grants: _grants, grantWeights: _grantWeights, voted: _voted, nullifiers: _nullifiers };
}

export function storeTupleContractCivicSource$Data(source: ContractCivicSource$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeAddress(source.verifier);
    builder.writeCell(source.grants.size > 0 ? beginCell().storeDictDirect(source.grants, Dictionary.Keys.BigInt(257), Dictionary.Values.BigUint(64)).endCell() : null);
    builder.writeCell(source.grantWeights.size > 0 ? beginCell().storeDictDirect(source.grantWeights, Dictionary.Keys.BigInt(257), Dictionary.Values.BigVarUint(4)).endCell() : null);
    builder.writeCell(source.voted.size > 0 ? beginCell().storeDictDirect(source.voted, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool()).endCell() : null);
    builder.writeCell(source.nullifiers.size > 0 ? beginCell().storeDictDirect(source.nullifiers, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool()).endCell() : null);
    return builder.build();
}

export function dictValueParserContractCivicSource$Data(): DictionaryValue<ContractCivicSource$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContractCivicSource$Data(src)).endCell());
        },
        parse: (src) => {
            return loadContractCivicSource$Data(src.loadRef().beginParse());
        }
    }
}

export type CreateWalletDao = {
    $$type: 'CreateWalletDao';
    queryId: bigint;
    metadata: Cell;
    config: DaoConfig;
    params: Dictionary<bigint, DaoParam>;
}

export function storeCreateWalletDao(src: CreateWalletDao) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1524432903, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeRef(src.metadata);
        b_0.store(storeDaoConfig(src.config));
        b_0.storeDict(src.params, Dictionary.Keys.BigInt(257), dictValueParserDaoParam());
    };
}

export function loadCreateWalletDao(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1524432903) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _metadata = sc_0.loadRef();
    const _config = loadDaoConfig(sc_0);
    const _params = Dictionary.load(Dictionary.Keys.BigInt(257), dictValueParserDaoParam(), sc_0);
    return { $$type: 'CreateWalletDao' as const, queryId: _queryId, metadata: _metadata, config: _config, params: _params };
}

export function loadTupleCreateWalletDao(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _metadata = source.readCell();
    const _config = loadTupleDaoConfig(source);
    const _params = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserDaoParam(), source.readCellOpt());
    return { $$type: 'CreateWalletDao' as const, queryId: _queryId, metadata: _metadata, config: _config, params: _params };
}

export function loadGetterTupleCreateWalletDao(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _metadata = source.readCell();
    const _config = loadGetterTupleDaoConfig(source);
    const _params = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserDaoParam(), source.readCellOpt());
    return { $$type: 'CreateWalletDao' as const, queryId: _queryId, metadata: _metadata, config: _config, params: _params };
}

export function storeTupleCreateWalletDao(source: CreateWalletDao) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeCell(source.metadata);
    builder.writeTuple(storeTupleDaoConfig(source.config));
    builder.writeCell(source.params.size > 0 ? beginCell().storeDictDirect(source.params, Dictionary.Keys.BigInt(257), dictValueParserDaoParam()).endCell() : null);
    return builder.build();
}

export function dictValueParserCreateWalletDao(): DictionaryValue<CreateWalletDao> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeCreateWalletDao(src)).endCell());
        },
        parse: (src) => {
            return loadCreateWalletDao(src.loadRef().beginParse());
        }
    }
}

export type WalletCast = {
    $$type: 'WalletCast';
    queryId: bigint;
    voting: Address;
    optionAddress: Address;
}

export function storeWalletCast(src: WalletCast) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1524432897, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.voting);
        b_0.storeAddress(src.optionAddress);
    };
}

export function loadWalletCast(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1524432897) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _voting = sc_0.loadAddress();
    const _optionAddress = sc_0.loadAddress();
    return { $$type: 'WalletCast' as const, queryId: _queryId, voting: _voting, optionAddress: _optionAddress };
}

export function loadTupleWalletCast(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _voting = source.readAddress();
    const _optionAddress = source.readAddress();
    return { $$type: 'WalletCast' as const, queryId: _queryId, voting: _voting, optionAddress: _optionAddress };
}

export function loadGetterTupleWalletCast(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _voting = source.readAddress();
    const _optionAddress = source.readAddress();
    return { $$type: 'WalletCast' as const, queryId: _queryId, voting: _voting, optionAddress: _optionAddress };
}

export function storeTupleWalletCast(source: WalletCast) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.voting);
    builder.writeAddress(source.optionAddress);
    return builder.build();
}

export function dictValueParserWalletCast(): DictionaryValue<WalletCast> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeWalletCast(src)).endCell());
        },
        parse: (src) => {
            return loadWalletCast(src.loadRef().beginParse());
        }
    }
}

export type ProveWalletHolding = {
    $$type: 'ProveWalletHolding';
    queryId: bigint;
}

export function storeProveWalletHolding(src: ProveWalletHolding) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1524432898, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadProveWalletHolding(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1524432898) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'ProveWalletHolding' as const, queryId: _queryId };
}

export function loadTupleProveWalletHolding(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'ProveWalletHolding' as const, queryId: _queryId };
}

export function loadGetterTupleProveWalletHolding(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'ProveWalletHolding' as const, queryId: _queryId };
}

export function storeTupleProveWalletHolding(source: ProveWalletHolding) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserProveWalletHolding(): DictionaryValue<ProveWalletHolding> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeProveWalletHolding(src)).endCell());
        },
        parse: (src) => {
            return loadProveWalletHolding(src.loadRef().beginParse());
        }
    }
}

export type WalletCastRelay = {
    $$type: 'WalletCastRelay';
    queryId: bigint;
    voter: Address;
    voting: Address;
    optionAddress: Address;
}

export function storeWalletCastRelay(src: WalletCastRelay) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1524432899, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.voter);
        b_0.storeAddress(src.voting);
        b_0.storeAddress(src.optionAddress);
    };
}

export function loadWalletCastRelay(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1524432899) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _voter = sc_0.loadAddress();
    const _voting = sc_0.loadAddress();
    const _optionAddress = sc_0.loadAddress();
    return { $$type: 'WalletCastRelay' as const, queryId: _queryId, voter: _voter, voting: _voting, optionAddress: _optionAddress };
}

export function loadTupleWalletCastRelay(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _voter = source.readAddress();
    const _voting = source.readAddress();
    const _optionAddress = source.readAddress();
    return { $$type: 'WalletCastRelay' as const, queryId: _queryId, voter: _voter, voting: _voting, optionAddress: _optionAddress };
}

export function loadGetterTupleWalletCastRelay(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _voter = source.readAddress();
    const _voting = source.readAddress();
    const _optionAddress = source.readAddress();
    return { $$type: 'WalletCastRelay' as const, queryId: _queryId, voter: _voter, voting: _voting, optionAddress: _optionAddress };
}

export function storeTupleWalletCastRelay(source: WalletCastRelay) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.voter);
    builder.writeAddress(source.voting);
    builder.writeAddress(source.optionAddress);
    return builder.build();
}

export function dictValueParserWalletCastRelay(): DictionaryValue<WalletCastRelay> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeWalletCastRelay(src)).endCell());
        },
        parse: (src) => {
            return loadWalletCastRelay(src.loadRef().beginParse());
        }
    }
}

export type ContractWalletSource$Data = {
    $$type: 'ContractWalletSource$Data';
    owner: Address;
    voteJettonMaster: Address;
    nftCollection: Address | null;
    wallet: Address | null;
    eligible: Dictionary<Address, boolean>;
    voted: Dictionary<bigint, boolean>;
}

export function storeContractWalletSource$Data(src: ContractWalletSource$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.voteJettonMaster);
        b_0.storeAddress(src.nftCollection);
        const b_1 = new Builder();
        b_1.storeAddress(src.wallet);
        b_1.storeDict(src.eligible, Dictionary.Keys.Address(), Dictionary.Values.Bool());
        b_1.storeDict(src.voted, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadContractWalletSource$Data(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _voteJettonMaster = sc_0.loadAddress();
    const _nftCollection = sc_0.loadMaybeAddress();
    const sc_1 = sc_0.loadRef().beginParse();
    const _wallet = sc_1.loadMaybeAddress();
    const _eligible = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.Bool(), sc_1);
    const _voted = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), sc_1);
    return { $$type: 'ContractWalletSource$Data' as const, owner: _owner, voteJettonMaster: _voteJettonMaster, nftCollection: _nftCollection, wallet: _wallet, eligible: _eligible, voted: _voted };
}

export function loadTupleContractWalletSource$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _voteJettonMaster = source.readAddress();
    const _nftCollection = source.readAddressOpt();
    const _wallet = source.readAddressOpt();
    const _eligible = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.Bool(), source.readCellOpt());
    const _voted = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    return { $$type: 'ContractWalletSource$Data' as const, owner: _owner, voteJettonMaster: _voteJettonMaster, nftCollection: _nftCollection, wallet: _wallet, eligible: _eligible, voted: _voted };
}

export function loadGetterTupleContractWalletSource$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _voteJettonMaster = source.readAddress();
    const _nftCollection = source.readAddressOpt();
    const _wallet = source.readAddressOpt();
    const _eligible = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.Bool(), source.readCellOpt());
    const _voted = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    return { $$type: 'ContractWalletSource$Data' as const, owner: _owner, voteJettonMaster: _voteJettonMaster, nftCollection: _nftCollection, wallet: _wallet, eligible: _eligible, voted: _voted };
}

export function storeTupleContractWalletSource$Data(source: ContractWalletSource$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeAddress(source.voteJettonMaster);
    builder.writeAddress(source.nftCollection);
    builder.writeAddress(source.wallet);
    builder.writeCell(source.eligible.size > 0 ? beginCell().storeDictDirect(source.eligible, Dictionary.Keys.Address(), Dictionary.Values.Bool()).endCell() : null);
    builder.writeCell(source.voted.size > 0 ? beginCell().storeDictDirect(source.voted, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool()).endCell() : null);
    return builder.build();
}

export function dictValueParserContractWalletSource$Data(): DictionaryValue<ContractWalletSource$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContractWalletSource$Data(src)).endCell());
        },
        parse: (src) => {
            return loadContractWalletSource$Data(src.loadRef().beginParse());
        }
    }
}

export type CreateCollateralDao = {
    $$type: 'CreateCollateralDao';
    queryId: bigint;
    metadata: Cell;
    config: DaoConfig;
    params: Dictionary<bigint, DaoParam>;
}

export function storeCreateCollateralDao(src: CreateCollateralDao) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1524498439, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeRef(src.metadata);
        b_0.store(storeDaoConfig(src.config));
        b_0.storeDict(src.params, Dictionary.Keys.BigInt(257), dictValueParserDaoParam());
    };
}

export function loadCreateCollateralDao(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1524498439) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _metadata = sc_0.loadRef();
    const _config = loadDaoConfig(sc_0);
    const _params = Dictionary.load(Dictionary.Keys.BigInt(257), dictValueParserDaoParam(), sc_0);
    return { $$type: 'CreateCollateralDao' as const, queryId: _queryId, metadata: _metadata, config: _config, params: _params };
}

export function loadTupleCreateCollateralDao(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _metadata = source.readCell();
    const _config = loadTupleDaoConfig(source);
    const _params = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserDaoParam(), source.readCellOpt());
    return { $$type: 'CreateCollateralDao' as const, queryId: _queryId, metadata: _metadata, config: _config, params: _params };
}

export function loadGetterTupleCreateCollateralDao(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _metadata = source.readCell();
    const _config = loadGetterTupleDaoConfig(source);
    const _params = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserDaoParam(), source.readCellOpt());
    return { $$type: 'CreateCollateralDao' as const, queryId: _queryId, metadata: _metadata, config: _config, params: _params };
}

export function storeTupleCreateCollateralDao(source: CreateCollateralDao) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeCell(source.metadata);
    builder.writeTuple(storeTupleDaoConfig(source.config));
    builder.writeCell(source.params.size > 0 ? beginCell().storeDictDirect(source.params, Dictionary.Keys.BigInt(257), dictValueParserDaoParam()).endCell() : null);
    return builder.build();
}

export function dictValueParserCreateCollateralDao(): DictionaryValue<CreateCollateralDao> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeCreateCollateralDao(src)).endCell());
        },
        parse: (src) => {
            return loadCreateCollateralDao(src.loadRef().beginParse());
        }
    }
}

export type CollateralVote = {
    $$type: 'CollateralVote';
    queryId: bigint;
    voting: Address;
    optionAddress: Address;
    endTime: bigint;
}

export function storeCollateralVote(src: CollateralVote) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1524498433, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.voting);
        b_0.storeAddress(src.optionAddress);
        b_0.storeUint(src.endTime, 64);
    };
}

export function loadCollateralVote(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1524498433) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _voting = sc_0.loadAddress();
    const _optionAddress = sc_0.loadAddress();
    const _endTime = sc_0.loadUintBig(64);
    return { $$type: 'CollateralVote' as const, queryId: _queryId, voting: _voting, optionAddress: _optionAddress, endTime: _endTime };
}

export function loadTupleCollateralVote(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _voting = source.readAddress();
    const _optionAddress = source.readAddress();
    const _endTime = source.readBigNumber();
    return { $$type: 'CollateralVote' as const, queryId: _queryId, voting: _voting, optionAddress: _optionAddress, endTime: _endTime };
}

export function loadGetterTupleCollateralVote(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _voting = source.readAddress();
    const _optionAddress = source.readAddress();
    const _endTime = source.readBigNumber();
    return { $$type: 'CollateralVote' as const, queryId: _queryId, voting: _voting, optionAddress: _optionAddress, endTime: _endTime };
}

export function storeTupleCollateralVote(source: CollateralVote) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.voting);
    builder.writeAddress(source.optionAddress);
    builder.writeNumber(source.endTime);
    return builder.build();
}

export function dictValueParserCollateralVote(): DictionaryValue<CollateralVote> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeCollateralVote(src)).endCell());
        },
        parse: (src) => {
            return loadCollateralVote(src.loadRef().beginParse());
        }
    }
}

export type CollateralUnlock = {
    $$type: 'CollateralUnlock';
    queryId: bigint;
    amount: bigint;
}

export function storeCollateralUnlock(src: CollateralUnlock) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1524498434, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeCoins(src.amount);
    };
}

export function loadCollateralUnlock(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1524498434) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _amount = sc_0.loadCoins();
    return { $$type: 'CollateralUnlock' as const, queryId: _queryId, amount: _amount };
}

export function loadTupleCollateralUnlock(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    return { $$type: 'CollateralUnlock' as const, queryId: _queryId, amount: _amount };
}

export function loadGetterTupleCollateralUnlock(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    return { $$type: 'CollateralUnlock' as const, queryId: _queryId, amount: _amount };
}

export function storeTupleCollateralUnlock(source: CollateralUnlock) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.amount);
    return builder.build();
}

export function dictValueParserCollateralUnlock(): DictionaryValue<CollateralUnlock> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeCollateralUnlock(src)).endCell());
        },
        parse: (src) => {
            return loadCollateralUnlock(src.loadRef().beginParse());
        }
    }
}

export type RelayCollateralVote = {
    $$type: 'RelayCollateralVote';
    queryId: bigint;
    voter: Address;
    voting: Address;
    optionAddress: Address;
}

export function storeRelayCollateralVote(src: RelayCollateralVote) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1524498436, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.voter);
        b_0.storeAddress(src.voting);
        b_0.storeAddress(src.optionAddress);
    };
}

export function loadRelayCollateralVote(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1524498436) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _voter = sc_0.loadAddress();
    const _voting = sc_0.loadAddress();
    const _optionAddress = sc_0.loadAddress();
    return { $$type: 'RelayCollateralVote' as const, queryId: _queryId, voter: _voter, voting: _voting, optionAddress: _optionAddress };
}

export function loadTupleRelayCollateralVote(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _voter = source.readAddress();
    const _voting = source.readAddress();
    const _optionAddress = source.readAddress();
    return { $$type: 'RelayCollateralVote' as const, queryId: _queryId, voter: _voter, voting: _voting, optionAddress: _optionAddress };
}

export function loadGetterTupleRelayCollateralVote(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _voter = source.readAddress();
    const _voting = source.readAddress();
    const _optionAddress = source.readAddress();
    return { $$type: 'RelayCollateralVote' as const, queryId: _queryId, voter: _voter, voting: _voting, optionAddress: _optionAddress };
}

export function storeTupleRelayCollateralVote(source: RelayCollateralVote) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.voter);
    builder.writeAddress(source.voting);
    builder.writeAddress(source.optionAddress);
    return builder.build();
}

export function dictValueParserRelayCollateralVote(): DictionaryValue<RelayCollateralVote> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRelayCollateralVote(src)).endCell());
        },
        parse: (src) => {
            return loadRelayCollateralVote(src.loadRef().beginParse());
        }
    }
}

export type SeizeCollateral = {
    $$type: 'SeizeCollateral';
    queryId: bigint;
    user: Address;
    amount: bigint;
    to: Address;
}

export function storeSeizeCollateral(src: SeizeCollateral) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1524498435, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.user);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.to);
    };
}

export function loadSeizeCollateral(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1524498435) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _user = sc_0.loadAddress();
    const _amount = sc_0.loadCoins();
    const _to = sc_0.loadAddress();
    return { $$type: 'SeizeCollateral' as const, queryId: _queryId, user: _user, amount: _amount, to: _to };
}

export function loadTupleSeizeCollateral(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _user = source.readAddress();
    const _amount = source.readBigNumber();
    const _to = source.readAddress();
    return { $$type: 'SeizeCollateral' as const, queryId: _queryId, user: _user, amount: _amount, to: _to };
}

export function loadGetterTupleSeizeCollateral(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _user = source.readAddress();
    const _amount = source.readBigNumber();
    const _to = source.readAddress();
    return { $$type: 'SeizeCollateral' as const, queryId: _queryId, user: _user, amount: _amount, to: _to };
}

export function storeTupleSeizeCollateral(source: SeizeCollateral) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.user);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.to);
    return builder.build();
}

export function dictValueParserSeizeCollateral(): DictionaryValue<SeizeCollateral> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSeizeCollateral(src)).endCell());
        },
        parse: (src) => {
            return loadSeizeCollateral(src.loadRef().beginParse());
        }
    }
}

export type ContractCollateralSource$Data = {
    $$type: 'ContractCollateralSource$Data';
    owner: Address;
    voteJettonMaster: Address;
    wallet: Address | null;
    totalLocked: bigint;
    locked: Dictionary<Address, bigint>;
    lockUntil: Dictionary<Address, bigint>;
    voted: Dictionary<bigint, boolean>;
    votings: Dictionary<Address, bigint>;
}

export function storeContractCollateralSource$Data(src: ContractCollateralSource$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.voteJettonMaster);
        b_0.storeAddress(src.wallet);
        b_0.storeCoins(src.totalLocked);
        b_0.storeDict(src.locked, Dictionary.Keys.Address(), Dictionary.Values.BigVarUint(4));
        b_0.storeDict(src.lockUntil, Dictionary.Keys.Address(), Dictionary.Values.BigUint(64));
        const b_1 = new Builder();
        b_1.storeDict(src.voted, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool());
        b_1.storeDict(src.votings, Dictionary.Keys.Address(), Dictionary.Values.BigUint(64));
        b_0.storeRef(b_1.endCell());
    };
}

export function loadContractCollateralSource$Data(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _voteJettonMaster = sc_0.loadAddress();
    const _wallet = sc_0.loadMaybeAddress();
    const _totalLocked = sc_0.loadCoins();
    const _locked = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigVarUint(4), sc_0);
    const _lockUntil = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigUint(64), sc_0);
    const sc_1 = sc_0.loadRef().beginParse();
    const _voted = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), sc_1);
    const _votings = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigUint(64), sc_1);
    return { $$type: 'ContractCollateralSource$Data' as const, owner: _owner, voteJettonMaster: _voteJettonMaster, wallet: _wallet, totalLocked: _totalLocked, locked: _locked, lockUntil: _lockUntil, voted: _voted, votings: _votings };
}

export function loadTupleContractCollateralSource$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _voteJettonMaster = source.readAddress();
    const _wallet = source.readAddressOpt();
    const _totalLocked = source.readBigNumber();
    const _locked = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigVarUint(4), source.readCellOpt());
    const _lockUntil = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigUint(64), source.readCellOpt());
    const _voted = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    const _votings = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigUint(64), source.readCellOpt());
    return { $$type: 'ContractCollateralSource$Data' as const, owner: _owner, voteJettonMaster: _voteJettonMaster, wallet: _wallet, totalLocked: _totalLocked, locked: _locked, lockUntil: _lockUntil, voted: _voted, votings: _votings };
}

export function loadGetterTupleContractCollateralSource$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _voteJettonMaster = source.readAddress();
    const _wallet = source.readAddressOpt();
    const _totalLocked = source.readBigNumber();
    const _locked = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigVarUint(4), source.readCellOpt());
    const _lockUntil = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigUint(64), source.readCellOpt());
    const _voted = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    const _votings = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigUint(64), source.readCellOpt());
    return { $$type: 'ContractCollateralSource$Data' as const, owner: _owner, voteJettonMaster: _voteJettonMaster, wallet: _wallet, totalLocked: _totalLocked, locked: _locked, lockUntil: _lockUntil, voted: _voted, votings: _votings };
}

export function storeTupleContractCollateralSource$Data(source: ContractCollateralSource$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeAddress(source.voteJettonMaster);
    builder.writeAddress(source.wallet);
    builder.writeNumber(source.totalLocked);
    builder.writeCell(source.locked.size > 0 ? beginCell().storeDictDirect(source.locked, Dictionary.Keys.Address(), Dictionary.Values.BigVarUint(4)).endCell() : null);
    builder.writeCell(source.lockUntil.size > 0 ? beginCell().storeDictDirect(source.lockUntil, Dictionary.Keys.Address(), Dictionary.Values.BigUint(64)).endCell() : null);
    builder.writeCell(source.voted.size > 0 ? beginCell().storeDictDirect(source.voted, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool()).endCell() : null);
    builder.writeCell(source.votings.size > 0 ? beginCell().storeDictDirect(source.votings, Dictionary.Keys.Address(), Dictionary.Values.BigUint(64)).endCell() : null);
    return builder.build();
}

export function dictValueParserContractCollateralSource$Data(): DictionaryValue<ContractCollateralSource$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContractCollateralSource$Data(src)).endCell());
        },
        parse: (src) => {
            return loadContractCollateralSource$Data(src.loadRef().beginParse());
        }
    }
}

export type PathConfig = {
    $$type: 'PathConfig';
    enabled: boolean;
    amount: bigint;
    quorum: bigint;
}

export function storePathConfig(src: PathConfig) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBit(src.enabled);
        b_0.storeCoins(src.amount);
        b_0.storeUint(src.quorum, 8);
    };
}

export function loadPathConfig(slice: Slice) {
    const sc_0 = slice;
    const _enabled = sc_0.loadBit();
    const _amount = sc_0.loadCoins();
    const _quorum = sc_0.loadUintBig(8);
    return { $$type: 'PathConfig' as const, enabled: _enabled, amount: _amount, quorum: _quorum };
}

export function loadTuplePathConfig(source: TupleReader) {
    const _enabled = source.readBoolean();
    const _amount = source.readBigNumber();
    const _quorum = source.readBigNumber();
    return { $$type: 'PathConfig' as const, enabled: _enabled, amount: _amount, quorum: _quorum };
}

export function loadGetterTuplePathConfig(source: TupleReader) {
    const _enabled = source.readBoolean();
    const _amount = source.readBigNumber();
    const _quorum = source.readBigNumber();
    return { $$type: 'PathConfig' as const, enabled: _enabled, amount: _amount, quorum: _quorum };
}

export function storeTuplePathConfig(source: PathConfig) {
    const builder = new TupleBuilder();
    builder.writeBoolean(source.enabled);
    builder.writeNumber(source.amount);
    builder.writeNumber(source.quorum);
    return builder.build();
}

export function dictValueParserPathConfig(): DictionaryValue<PathConfig> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storePathConfig(src)).endCell());
        },
        parse: (src) => {
            return loadPathConfig(src.loadRef().beginParse());
        }
    }
}

export type SetPathConfig = {
    $$type: 'SetPathConfig';
    queryId: bigint;
    pathId: bigint;
    config: PathConfig;
}

export function storeSetPathConfig(src: SetPathConfig) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1524367376, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeUint(src.pathId, 8);
        b_0.store(storePathConfig(src.config));
    };
}

export function loadSetPathConfig(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1524367376) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _pathId = sc_0.loadUintBig(8);
    const _config = loadPathConfig(sc_0);
    return { $$type: 'SetPathConfig' as const, queryId: _queryId, pathId: _pathId, config: _config };
}

export function loadTupleSetPathConfig(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _pathId = source.readBigNumber();
    const _config = loadTuplePathConfig(source);
    return { $$type: 'SetPathConfig' as const, queryId: _queryId, pathId: _pathId, config: _config };
}

export function loadGetterTupleSetPathConfig(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _pathId = source.readBigNumber();
    const _config = loadGetterTuplePathConfig(source);
    return { $$type: 'SetPathConfig' as const, queryId: _queryId, pathId: _pathId, config: _config };
}

export function storeTupleSetPathConfig(source: SetPathConfig) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.pathId);
    builder.writeTuple(storeTuplePathConfig(source.config));
    return builder.build();
}

export function dictValueParserSetPathConfig(): DictionaryValue<SetPathConfig> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetPathConfig(src)).endCell());
        },
        parse: (src) => {
            return loadSetPathConfig(src.loadRef().beginParse());
        }
    }
}

export type ClaimCitizenshipPay = {
    $$type: 'ClaimCitizenshipPay';
    queryId: bigint;
    passportCommit: bigint;
}

export function storeClaimCitizenshipPay(src: ClaimCitizenshipPay) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1524367377, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeUint(src.passportCommit, 256);
    };
}

export function loadClaimCitizenshipPay(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1524367377) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _passportCommit = sc_0.loadUintBig(256);
    return { $$type: 'ClaimCitizenshipPay' as const, queryId: _queryId, passportCommit: _passportCommit };
}

export function loadTupleClaimCitizenshipPay(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _passportCommit = source.readBigNumber();
    return { $$type: 'ClaimCitizenshipPay' as const, queryId: _queryId, passportCommit: _passportCommit };
}

export function loadGetterTupleClaimCitizenshipPay(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _passportCommit = source.readBigNumber();
    return { $$type: 'ClaimCitizenshipPay' as const, queryId: _queryId, passportCommit: _passportCommit };
}

export function storeTupleClaimCitizenshipPay(source: ClaimCitizenshipPay) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.passportCommit);
    return builder.build();
}

export function dictValueParserClaimCitizenshipPay(): DictionaryValue<ClaimCitizenshipPay> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeClaimCitizenshipPay(src)).endCell());
        },
        parse: (src) => {
            return loadClaimCitizenshipPay(src.loadRef().beginParse());
        }
    }
}

export type SetPathPayRules = {
    $$type: 'SetPathPayRules';
    queryId: bigint;
    enabled: boolean;
    minAmount: bigint;
}

export function storeSetPathPayRules(src: SetPathPayRules) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1524367378, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeBit(src.enabled);
        b_0.storeCoins(src.minAmount);
    };
}

export function loadSetPathPayRules(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1524367378) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _enabled = sc_0.loadBit();
    const _minAmount = sc_0.loadCoins();
    return { $$type: 'SetPathPayRules' as const, queryId: _queryId, enabled: _enabled, minAmount: _minAmount };
}

export function loadTupleSetPathPayRules(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _enabled = source.readBoolean();
    const _minAmount = source.readBigNumber();
    return { $$type: 'SetPathPayRules' as const, queryId: _queryId, enabled: _enabled, minAmount: _minAmount };
}

export function loadGetterTupleSetPathPayRules(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _enabled = source.readBoolean();
    const _minAmount = source.readBigNumber();
    return { $$type: 'SetPathPayRules' as const, queryId: _queryId, enabled: _enabled, minAmount: _minAmount };
}

export function storeTupleSetPathPayRules(source: SetPathPayRules) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeBoolean(source.enabled);
    builder.writeNumber(source.minAmount);
    return builder.build();
}

export function dictValueParserSetPathPayRules(): DictionaryValue<SetPathPayRules> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetPathPayRules(src)).endCell());
        },
        parse: (src) => {
            return loadSetPathPayRules(src.loadRef().beginParse());
        }
    }
}

export type ContractCitizenshipHub$Data = {
    $$type: 'ContractCitizenshipHub$Data';
    dao: Address;
    configs: Dictionary<bigint, PathConfig>;
}

export function storeContractCitizenshipHub$Data(src: ContractCitizenshipHub$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.dao);
        b_0.storeDict(src.configs, Dictionary.Keys.BigInt(257), dictValueParserPathConfig());
    };
}

export function loadContractCitizenshipHub$Data(slice: Slice) {
    const sc_0 = slice;
    const _dao = sc_0.loadAddress();
    const _configs = Dictionary.load(Dictionary.Keys.BigInt(257), dictValueParserPathConfig(), sc_0);
    return { $$type: 'ContractCitizenshipHub$Data' as const, dao: _dao, configs: _configs };
}

export function loadTupleContractCitizenshipHub$Data(source: TupleReader) {
    const _dao = source.readAddress();
    const _configs = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserPathConfig(), source.readCellOpt());
    return { $$type: 'ContractCitizenshipHub$Data' as const, dao: _dao, configs: _configs };
}

export function loadGetterTupleContractCitizenshipHub$Data(source: TupleReader) {
    const _dao = source.readAddress();
    const _configs = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserPathConfig(), source.readCellOpt());
    return { $$type: 'ContractCitizenshipHub$Data' as const, dao: _dao, configs: _configs };
}

export function storeTupleContractCitizenshipHub$Data(source: ContractCitizenshipHub$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.dao);
    builder.writeCell(source.configs.size > 0 ? beginCell().storeDictDirect(source.configs, Dictionary.Keys.BigInt(257), dictValueParserPathConfig()).endCell() : null);
    return builder.build();
}

export function dictValueParserContractCitizenshipHub$Data(): DictionaryValue<ContractCitizenshipHub$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContractCitizenshipHub$Data(src)).endCell());
        },
        parse: (src) => {
            return loadContractCitizenshipHub$Data(src.loadRef().beginParse());
        }
    }
}

export type ContractPathPay$Data = {
    $$type: 'ContractPathPay$Data';
    dao: Address;
    hub: Address;
    enabled: boolean;
    minAmount: bigint;
    wallet: Address | null;
}

export function storeContractPathPay$Data(src: ContractPathPay$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.dao);
        b_0.storeAddress(src.hub);
        b_0.storeBit(src.enabled);
        b_0.storeCoins(src.minAmount);
        b_0.storeAddress(src.wallet);
    };
}

export function loadContractPathPay$Data(slice: Slice) {
    const sc_0 = slice;
    const _dao = sc_0.loadAddress();
    const _hub = sc_0.loadAddress();
    const _enabled = sc_0.loadBit();
    const _minAmount = sc_0.loadCoins();
    const _wallet = sc_0.loadMaybeAddress();
    return { $$type: 'ContractPathPay$Data' as const, dao: _dao, hub: _hub, enabled: _enabled, minAmount: _minAmount, wallet: _wallet };
}

export function loadTupleContractPathPay$Data(source: TupleReader) {
    const _dao = source.readAddress();
    const _hub = source.readAddress();
    const _enabled = source.readBoolean();
    const _minAmount = source.readBigNumber();
    const _wallet = source.readAddressOpt();
    return { $$type: 'ContractPathPay$Data' as const, dao: _dao, hub: _hub, enabled: _enabled, minAmount: _minAmount, wallet: _wallet };
}

export function loadGetterTupleContractPathPay$Data(source: TupleReader) {
    const _dao = source.readAddress();
    const _hub = source.readAddress();
    const _enabled = source.readBoolean();
    const _minAmount = source.readBigNumber();
    const _wallet = source.readAddressOpt();
    return { $$type: 'ContractPathPay$Data' as const, dao: _dao, hub: _hub, enabled: _enabled, minAmount: _minAmount, wallet: _wallet };
}

export function storeTupleContractPathPay$Data(source: ContractPathPay$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.dao);
    builder.writeAddress(source.hub);
    builder.writeBoolean(source.enabled);
    builder.writeNumber(source.minAmount);
    builder.writeAddress(source.wallet);
    return builder.build();
}

export function dictValueParserContractPathPay$Data(): DictionaryValue<ContractPathPay$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContractPathPay$Data(src)).endCell());
        },
        parse: (src) => {
            return loadContractPathPay$Data(src.loadRef().beginParse());
        }
    }
}

export type UnlockPrivatizationFund = {
    $$type: 'UnlockPrivatizationFund';
    queryId: bigint;
    totalCitizens: bigint;
}

export function storeUnlockPrivatizationFund(src: UnlockPrivatizationFund) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1524368129, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeUint(src.totalCitizens, 32);
    };
}

export function loadUnlockPrivatizationFund(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1524368129) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _totalCitizens = sc_0.loadUintBig(32);
    return { $$type: 'UnlockPrivatizationFund' as const, queryId: _queryId, totalCitizens: _totalCitizens };
}

export function loadTupleUnlockPrivatizationFund(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _totalCitizens = source.readBigNumber();
    return { $$type: 'UnlockPrivatizationFund' as const, queryId: _queryId, totalCitizens: _totalCitizens };
}

export function loadGetterTupleUnlockPrivatizationFund(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _totalCitizens = source.readBigNumber();
    return { $$type: 'UnlockPrivatizationFund' as const, queryId: _queryId, totalCitizens: _totalCitizens };
}

export function storeTupleUnlockPrivatizationFund(source: UnlockPrivatizationFund) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.totalCitizens);
    return builder.build();
}

export function dictValueParserUnlockPrivatizationFund(): DictionaryValue<UnlockPrivatizationFund> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUnlockPrivatizationFund(src)).endCell());
        },
        parse: (src) => {
            return loadUnlockPrivatizationFund(src.loadRef().beginParse());
        }
    }
}

export type ClaimShare = {
    $$type: 'ClaimShare';
    queryId: bigint;
}

export function storeClaimShare(src: ClaimShare) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1524368130, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadClaimShare(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1524368130) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'ClaimShare' as const, queryId: _queryId };
}

export function loadTupleClaimShare(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'ClaimShare' as const, queryId: _queryId };
}

export function loadGetterTupleClaimShare(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'ClaimShare' as const, queryId: _queryId };
}

export function storeTupleClaimShare(source: ClaimShare) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserClaimShare(): DictionaryValue<ClaimShare> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeClaimShare(src)).endCell());
        },
        parse: (src) => {
            return loadClaimShare(src.loadRef().beginParse());
        }
    }
}

export type AddPrivatizationClaimant = {
    $$type: 'AddPrivatizationClaimant';
    queryId: bigint;
    who: Address;
}

export function storeAddPrivatizationClaimant(src: AddPrivatizationClaimant) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1524368134, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.who);
    };
}

export function loadAddPrivatizationClaimant(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1524368134) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _who = sc_0.loadAddress();
    return { $$type: 'AddPrivatizationClaimant' as const, queryId: _queryId, who: _who };
}

export function loadTupleAddPrivatizationClaimant(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _who = source.readAddress();
    return { $$type: 'AddPrivatizationClaimant' as const, queryId: _queryId, who: _who };
}

export function loadGetterTupleAddPrivatizationClaimant(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _who = source.readAddress();
    return { $$type: 'AddPrivatizationClaimant' as const, queryId: _queryId, who: _who };
}

export function storeTupleAddPrivatizationClaimant(source: AddPrivatizationClaimant) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.who);
    return builder.build();
}

export function dictValueParserAddPrivatizationClaimant(): DictionaryValue<AddPrivatizationClaimant> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeAddPrivatizationClaimant(src)).endCell());
        },
        parse: (src) => {
            return loadAddPrivatizationClaimant(src.loadRef().beginParse());
        }
    }
}

export type ContractPrivatizationFund$Data = {
    $$type: 'ContractPrivatizationFund$Data';
    dao: Address;
    unlocked: boolean;
    totalShares: bigint;
    sharePerCitizen: bigint;
    balance: bigint;
    wallet: Address | null;
    claimed: Dictionary<Address, boolean>;
    eligible: Dictionary<Address, boolean>;
}

export function storeContractPrivatizationFund$Data(src: ContractPrivatizationFund$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.dao);
        b_0.storeBit(src.unlocked);
        b_0.storeUint(src.totalShares, 32);
        b_0.storeCoins(src.sharePerCitizen);
        b_0.storeCoins(src.balance);
        b_0.storeAddress(src.wallet);
        b_0.storeDict(src.claimed, Dictionary.Keys.Address(), Dictionary.Values.Bool());
        b_0.storeDict(src.eligible, Dictionary.Keys.Address(), Dictionary.Values.Bool());
    };
}

export function loadContractPrivatizationFund$Data(slice: Slice) {
    const sc_0 = slice;
    const _dao = sc_0.loadAddress();
    const _unlocked = sc_0.loadBit();
    const _totalShares = sc_0.loadUintBig(32);
    const _sharePerCitizen = sc_0.loadCoins();
    const _balance = sc_0.loadCoins();
    const _wallet = sc_0.loadMaybeAddress();
    const _claimed = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.Bool(), sc_0);
    const _eligible = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.Bool(), sc_0);
    return { $$type: 'ContractPrivatizationFund$Data' as const, dao: _dao, unlocked: _unlocked, totalShares: _totalShares, sharePerCitizen: _sharePerCitizen, balance: _balance, wallet: _wallet, claimed: _claimed, eligible: _eligible };
}

export function loadTupleContractPrivatizationFund$Data(source: TupleReader) {
    const _dao = source.readAddress();
    const _unlocked = source.readBoolean();
    const _totalShares = source.readBigNumber();
    const _sharePerCitizen = source.readBigNumber();
    const _balance = source.readBigNumber();
    const _wallet = source.readAddressOpt();
    const _claimed = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.Bool(), source.readCellOpt());
    const _eligible = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.Bool(), source.readCellOpt());
    return { $$type: 'ContractPrivatizationFund$Data' as const, dao: _dao, unlocked: _unlocked, totalShares: _totalShares, sharePerCitizen: _sharePerCitizen, balance: _balance, wallet: _wallet, claimed: _claimed, eligible: _eligible };
}

export function loadGetterTupleContractPrivatizationFund$Data(source: TupleReader) {
    const _dao = source.readAddress();
    const _unlocked = source.readBoolean();
    const _totalShares = source.readBigNumber();
    const _sharePerCitizen = source.readBigNumber();
    const _balance = source.readBigNumber();
    const _wallet = source.readAddressOpt();
    const _claimed = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.Bool(), source.readCellOpt());
    const _eligible = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.Bool(), source.readCellOpt());
    return { $$type: 'ContractPrivatizationFund$Data' as const, dao: _dao, unlocked: _unlocked, totalShares: _totalShares, sharePerCitizen: _sharePerCitizen, balance: _balance, wallet: _wallet, claimed: _claimed, eligible: _eligible };
}

export function storeTupleContractPrivatizationFund$Data(source: ContractPrivatizationFund$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.dao);
    builder.writeBoolean(source.unlocked);
    builder.writeNumber(source.totalShares);
    builder.writeNumber(source.sharePerCitizen);
    builder.writeNumber(source.balance);
    builder.writeAddress(source.wallet);
    builder.writeCell(source.claimed.size > 0 ? beginCell().storeDictDirect(source.claimed, Dictionary.Keys.Address(), Dictionary.Values.Bool()).endCell() : null);
    builder.writeCell(source.eligible.size > 0 ? beginCell().storeDictDirect(source.eligible, Dictionary.Keys.Address(), Dictionary.Values.Bool()).endCell() : null);
    return builder.build();
}

export function dictValueParserContractPrivatizationFund$Data(): DictionaryValue<ContractPrivatizationFund$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContractPrivatizationFund$Data(src)).endCell());
        },
        parse: (src) => {
            return loadContractPrivatizationFund$Data(src.loadRef().beginParse());
        }
    }
}

export type PushMonthly = {
    $$type: 'PushMonthly';
    queryId: bigint;
}

export function storePushMonthly(src: PushMonthly) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1524368131, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadPushMonthly(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1524368131) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'PushMonthly' as const, queryId: _queryId };
}

export function loadTuplePushMonthly(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'PushMonthly' as const, queryId: _queryId };
}

export function loadGetterTuplePushMonthly(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'PushMonthly' as const, queryId: _queryId };
}

export function storeTuplePushMonthly(source: PushMonthly) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserPushMonthly(): DictionaryValue<PushMonthly> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storePushMonthly(src)).endCell());
        },
        parse: (src) => {
            return loadPushMonthly(src.loadRef().beginParse());
        }
    }
}

export type ContractLiberationFund$Data = {
    $$type: 'ContractLiberationFund$Data';
    dao: Address;
    budget: Address;
    balance: bigint;
    wallet: Address | null;
    lastPush: bigint;
}

export function storeContractLiberationFund$Data(src: ContractLiberationFund$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.dao);
        b_0.storeAddress(src.budget);
        b_0.storeCoins(src.balance);
        b_0.storeAddress(src.wallet);
        b_0.storeUint(src.lastPush, 64);
    };
}

export function loadContractLiberationFund$Data(slice: Slice) {
    const sc_0 = slice;
    const _dao = sc_0.loadAddress();
    const _budget = sc_0.loadAddress();
    const _balance = sc_0.loadCoins();
    const _wallet = sc_0.loadMaybeAddress();
    const _lastPush = sc_0.loadUintBig(64);
    return { $$type: 'ContractLiberationFund$Data' as const, dao: _dao, budget: _budget, balance: _balance, wallet: _wallet, lastPush: _lastPush };
}

export function loadTupleContractLiberationFund$Data(source: TupleReader) {
    const _dao = source.readAddress();
    const _budget = source.readAddress();
    const _balance = source.readBigNumber();
    const _wallet = source.readAddressOpt();
    const _lastPush = source.readBigNumber();
    return { $$type: 'ContractLiberationFund$Data' as const, dao: _dao, budget: _budget, balance: _balance, wallet: _wallet, lastPush: _lastPush };
}

export function loadGetterTupleContractLiberationFund$Data(source: TupleReader) {
    const _dao = source.readAddress();
    const _budget = source.readAddress();
    const _balance = source.readBigNumber();
    const _wallet = source.readAddressOpt();
    const _lastPush = source.readBigNumber();
    return { $$type: 'ContractLiberationFund$Data' as const, dao: _dao, budget: _budget, balance: _balance, wallet: _wallet, lastPush: _lastPush };
}

export function storeTupleContractLiberationFund$Data(source: ContractLiberationFund$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.dao);
    builder.writeAddress(source.budget);
    builder.writeNumber(source.balance);
    builder.writeAddress(source.wallet);
    builder.writeNumber(source.lastPush);
    return builder.build();
}

export function dictValueParserContractLiberationFund$Data(): DictionaryValue<ContractLiberationFund$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContractLiberationFund$Data(src)).endCell());
        },
        parse: (src) => {
            return loadContractLiberationFund$Data(src.loadRef().beginParse());
        }
    }
}

export type ConfigureTreasuryTopup = {
    $$type: 'ConfigureTreasuryTopup';
    queryId: bigint;
    mode: bigint;
    amount: bigint;
    periodSec: bigint;
}

export function storeConfigureTreasuryTopup(src: ConfigureTreasuryTopup) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1524368132, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeUint(src.mode, 8);
        b_0.storeUint(src.amount, 64);
        b_0.storeUint(src.periodSec, 32);
    };
}

export function loadConfigureTreasuryTopup(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1524368132) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _mode = sc_0.loadUintBig(8);
    const _amount = sc_0.loadUintBig(64);
    const _periodSec = sc_0.loadUintBig(32);
    return { $$type: 'ConfigureTreasuryTopup' as const, queryId: _queryId, mode: _mode, amount: _amount, periodSec: _periodSec };
}

export function loadTupleConfigureTreasuryTopup(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _mode = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _periodSec = source.readBigNumber();
    return { $$type: 'ConfigureTreasuryTopup' as const, queryId: _queryId, mode: _mode, amount: _amount, periodSec: _periodSec };
}

export function loadGetterTupleConfigureTreasuryTopup(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _mode = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _periodSec = source.readBigNumber();
    return { $$type: 'ConfigureTreasuryTopup' as const, queryId: _queryId, mode: _mode, amount: _amount, periodSec: _periodSec };
}

export function storeTupleConfigureTreasuryTopup(source: ConfigureTreasuryTopup) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.mode);
    builder.writeNumber(source.amount);
    builder.writeNumber(source.periodSec);
    return builder.build();
}

export function dictValueParserConfigureTreasuryTopup(): DictionaryValue<ConfigureTreasuryTopup> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeConfigureTreasuryTopup(src)).endCell());
        },
        parse: (src) => {
            return loadConfigureTreasuryTopup(src.loadRef().beginParse());
        }
    }
}

export type PushTreasuryTopup = {
    $$type: 'PushTreasuryTopup';
    queryId: bigint;
}

export function storePushTreasuryTopup(src: PushTreasuryTopup) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1524368133, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadPushTreasuryTopup(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1524368133) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'PushTreasuryTopup' as const, queryId: _queryId };
}

export function loadTuplePushTreasuryTopup(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'PushTreasuryTopup' as const, queryId: _queryId };
}

export function loadGetterTuplePushTreasuryTopup(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'PushTreasuryTopup' as const, queryId: _queryId };
}

export function storeTuplePushTreasuryTopup(source: PushTreasuryTopup) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserPushTreasuryTopup(): DictionaryValue<PushTreasuryTopup> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storePushTreasuryTopup(src)).endCell());
        },
        parse: (src) => {
            return loadPushTreasuryTopup(src.loadRef().beginParse());
        }
    }
}

export type ContractTreasuryTopupFund$Data = {
    $$type: 'ContractTreasuryTopupFund$Data';
    dao: Address;
    balance: bigint;
    wallet: Address | null;
    lastPush: bigint;
    mode: bigint;
    amount: bigint;
    periodSec: bigint;
    active: boolean;
}

export function storeContractTreasuryTopupFund$Data(src: ContractTreasuryTopupFund$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.dao);
        b_0.storeCoins(src.balance);
        b_0.storeAddress(src.wallet);
        b_0.storeUint(src.lastPush, 64);
        b_0.storeUint(src.mode, 8);
        b_0.storeUint(src.amount, 64);
        b_0.storeUint(src.periodSec, 32);
        b_0.storeBit(src.active);
    };
}

export function loadContractTreasuryTopupFund$Data(slice: Slice) {
    const sc_0 = slice;
    const _dao = sc_0.loadAddress();
    const _balance = sc_0.loadCoins();
    const _wallet = sc_0.loadMaybeAddress();
    const _lastPush = sc_0.loadUintBig(64);
    const _mode = sc_0.loadUintBig(8);
    const _amount = sc_0.loadUintBig(64);
    const _periodSec = sc_0.loadUintBig(32);
    const _active = sc_0.loadBit();
    return { $$type: 'ContractTreasuryTopupFund$Data' as const, dao: _dao, balance: _balance, wallet: _wallet, lastPush: _lastPush, mode: _mode, amount: _amount, periodSec: _periodSec, active: _active };
}

export function loadTupleContractTreasuryTopupFund$Data(source: TupleReader) {
    const _dao = source.readAddress();
    const _balance = source.readBigNumber();
    const _wallet = source.readAddressOpt();
    const _lastPush = source.readBigNumber();
    const _mode = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _periodSec = source.readBigNumber();
    const _active = source.readBoolean();
    return { $$type: 'ContractTreasuryTopupFund$Data' as const, dao: _dao, balance: _balance, wallet: _wallet, lastPush: _lastPush, mode: _mode, amount: _amount, periodSec: _periodSec, active: _active };
}

export function loadGetterTupleContractTreasuryTopupFund$Data(source: TupleReader) {
    const _dao = source.readAddress();
    const _balance = source.readBigNumber();
    const _wallet = source.readAddressOpt();
    const _lastPush = source.readBigNumber();
    const _mode = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _periodSec = source.readBigNumber();
    const _active = source.readBoolean();
    return { $$type: 'ContractTreasuryTopupFund$Data' as const, dao: _dao, balance: _balance, wallet: _wallet, lastPush: _lastPush, mode: _mode, amount: _amount, periodSec: _periodSec, active: _active };
}

export function storeTupleContractTreasuryTopupFund$Data(source: ContractTreasuryTopupFund$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.dao);
    builder.writeNumber(source.balance);
    builder.writeAddress(source.wallet);
    builder.writeNumber(source.lastPush);
    builder.writeNumber(source.mode);
    builder.writeNumber(source.amount);
    builder.writeNumber(source.periodSec);
    builder.writeBoolean(source.active);
    return builder.build();
}

export function dictValueParserContractTreasuryTopupFund$Data(): DictionaryValue<ContractTreasuryTopupFund$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContractTreasuryTopupFund$Data(src)).endCell());
        },
        parse: (src) => {
            return loadContractTreasuryTopupFund$Data(src.loadRef().beginParse());
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

export type DaoContainerV5$Data = {
    $$type: 'DaoContainerV5$Data';
    master: Address;
    creator: Address;
    metadata: Cell;
    config: DaoConfig;
    verified: boolean;
    voteWallet: Address | null;
    votingSeqno: bigint;
    actions: Dictionary<Address, DaoAction>;
    params: Dictionary<bigint, DaoParam>;
    daoType: bigint;
    pendingActions: bigint;
}

export function storeDaoContainerV5$Data(src: DaoContainerV5$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.master);
        b_0.storeAddress(src.creator);
        b_0.storeRef(src.metadata);
        const b_1 = new Builder();
        b_1.store(storeDaoConfig(src.config));
        b_1.storeBit(src.verified);
        const b_2 = new Builder();
        b_2.storeAddress(src.voteWallet);
        b_2.storeUint(src.votingSeqno, 32);
        b_2.storeDict(src.actions, Dictionary.Keys.Address(), dictValueParserDaoAction());
        b_2.storeDict(src.params, Dictionary.Keys.BigInt(257), dictValueParserDaoParam());
        b_2.storeUint(src.daoType, 8);
        b_2.storeUint(src.pendingActions, 16);
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadDaoContainerV5$Data(slice: Slice) {
    const sc_0 = slice;
    const _master = sc_0.loadAddress();
    const _creator = sc_0.loadAddress();
    const _metadata = sc_0.loadRef();
    const sc_1 = sc_0.loadRef().beginParse();
    const _config = loadDaoConfig(sc_1);
    const _verified = sc_1.loadBit();
    const sc_2 = sc_1.loadRef().beginParse();
    const _voteWallet = sc_2.loadMaybeAddress();
    const _votingSeqno = sc_2.loadUintBig(32);
    const _actions = Dictionary.load(Dictionary.Keys.Address(), dictValueParserDaoAction(), sc_2);
    const _params = Dictionary.load(Dictionary.Keys.BigInt(257), dictValueParserDaoParam(), sc_2);
    const _daoType = sc_2.loadUintBig(8);
    const _pendingActions = sc_2.loadUintBig(16);
    return { $$type: 'DaoContainerV5$Data' as const, master: _master, creator: _creator, metadata: _metadata, config: _config, verified: _verified, voteWallet: _voteWallet, votingSeqno: _votingSeqno, actions: _actions, params: _params, daoType: _daoType, pendingActions: _pendingActions };
}

export function loadTupleDaoContainerV5$Data(source: TupleReader) {
    const _master = source.readAddress();
    const _creator = source.readAddress();
    const _metadata = source.readCell();
    const _config = loadTupleDaoConfig(source);
    const _verified = source.readBoolean();
    const _voteWallet = source.readAddressOpt();
    const _votingSeqno = source.readBigNumber();
    const _actions = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserDaoAction(), source.readCellOpt());
    const _params = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserDaoParam(), source.readCellOpt());
    const _daoType = source.readBigNumber();
    const _pendingActions = source.readBigNumber();
    return { $$type: 'DaoContainerV5$Data' as const, master: _master, creator: _creator, metadata: _metadata, config: _config, verified: _verified, voteWallet: _voteWallet, votingSeqno: _votingSeqno, actions: _actions, params: _params, daoType: _daoType, pendingActions: _pendingActions };
}

export function loadGetterTupleDaoContainerV5$Data(source: TupleReader) {
    const _master = source.readAddress();
    const _creator = source.readAddress();
    const _metadata = source.readCell();
    const _config = loadGetterTupleDaoConfig(source);
    const _verified = source.readBoolean();
    const _voteWallet = source.readAddressOpt();
    const _votingSeqno = source.readBigNumber();
    const _actions = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserDaoAction(), source.readCellOpt());
    const _params = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserDaoParam(), source.readCellOpt());
    const _daoType = source.readBigNumber();
    const _pendingActions = source.readBigNumber();
    return { $$type: 'DaoContainerV5$Data' as const, master: _master, creator: _creator, metadata: _metadata, config: _config, verified: _verified, voteWallet: _voteWallet, votingSeqno: _votingSeqno, actions: _actions, params: _params, daoType: _daoType, pendingActions: _pendingActions };
}

export function storeTupleDaoContainerV5$Data(source: DaoContainerV5$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.master);
    builder.writeAddress(source.creator);
    builder.writeCell(source.metadata);
    builder.writeTuple(storeTupleDaoConfig(source.config));
    builder.writeBoolean(source.verified);
    builder.writeAddress(source.voteWallet);
    builder.writeNumber(source.votingSeqno);
    builder.writeCell(source.actions.size > 0 ? beginCell().storeDictDirect(source.actions, Dictionary.Keys.Address(), dictValueParserDaoAction()).endCell() : null);
    builder.writeCell(source.params.size > 0 ? beginCell().storeDictDirect(source.params, Dictionary.Keys.BigInt(257), dictValueParserDaoParam()).endCell() : null);
    builder.writeNumber(source.daoType);
    builder.writeNumber(source.pendingActions);
    return builder.build();
}

export function dictValueParserDaoContainerV5$Data(): DictionaryValue<DaoContainerV5$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDaoContainerV5$Data(src)).endCell());
        },
        parse: (src) => {
            return loadDaoContainerV5$Data(src.loadRef().beginParse());
        }
    }
}

 type ContractVaultDAOv1_init_args = {
    $$type: 'ContractVaultDAOv1_init_args';
    owner: Address;
    status: bigint;
    data: OptionInfo;
}

function initContractVaultDAOv1_init_args(src: ContractVaultDAOv1_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeUint(src.status, 4);
        b_0.store(storeOptionInfo(src.data));
    };
}

async function ContractVaultDAOv1_init(owner: Address, status: bigint, data: OptionInfo) {
    const __code = Cell.fromHex('b5ee9c724101040100b2000228ff008e88f4a413f4bcf2c80bed5320e303ed43d901030139a64582bb51343e9034c0f50074007500740484090408db0536cf1b10a00200025c00ea3001d072d721d200d200fa4021103450666f04f86102f862ed44d0fa40d303d401d001d401d012102410236c1405925f05e003d70d1ff2e082308210db89bc8aba8e2c8200f0f6f84223c705f2f48200b26c01c000f2f4027159c855305034cecb030201c8ce12cd01c8cecdc9ed54e05f04f2c082985217eb');
    const builder = beginCell();
    initContractVaultDAOv1_init_args({ $$type: 'ContractVaultDAOv1_init_args', owner, status, data })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const ContractVaultDAOv1_errors = {
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
    1483: { message: "stake locked (active vote)" },
    2366: { message: "Incorrect balance after send" },
    5083: { message: "turnout needs total supply" },
    5419: { message: "bad duration" },
    6086: { message: "unknown voting" },
    7814: { message: "bad child" },
    7856: { message: "use ton create" },
    7992: { message: "claimed" },
    8447: { message: "bad dao type" },
    8928: { message: "bad bps" },
    9215: { message: "Incorrect sender" },
    9542: { message: "no wallet" },
    9748: { message: "support below dao baseline" },
    10363: { message: "Unauthorized burn" },
    10456: { message: "no collateral" },
    11186: { message: "voting over" },
    12074: { message: "empty" },
    12096: { message: "bad amount" },
    12119: { message: "insufficient amount" },
    12168: { message: "no dao type" },
    12286: { message: "bad mode" },
    14534: { message: "Not owner" },
    15534: { message: "expired" },
    16693: { message: "vote time is not over" },
    17478: { message: "use jetton create" },
    17495: { message: "too many pending actions" },
    17526: { message: "voting shorter than dao minimum" },
    18253: { message: "use weight source" },
    18372: { message: "amount" },
    19004: { message: "not civic" },
    19671: { message: "locked" },
    20990: { message: "bad citizen count" },
    21196: { message: "Contract is locked" },
    21429: { message: "already bound" },
    23980: { message: "already voted" },
    24490: { message: "no share" },
    26388: { message: "no payload" },
    26501: { message: "no amount" },
    27104: { message: "not a staker" },
    27503: { message: "no citizen count" },
    28022: { message: "voting already registered" },
    30277: { message: "Incoming transfers are locked" },
    30779: { message: "commit" },
    31019: { message: "path pay off" },
    32113: { message: "Insufficient amount of TON attached" },
    32176: { message: "no citizens" },
    32290: { message: "vote time is over" },
    32347: { message: "collateral locked (active vote)" },
    33865: { message: "dust" },
    34563: { message: "no weight cast" },
    35681: { message: "bad fee" },
    35838: { message: "insufficient ton" },
    36784: { message: "wallet already bound" },
    37097: { message: "no destination" },
    38577: { message: "quorum below dao baseline" },
    38787: { message: "nothing to reclaim" },
    38828: { message: "bad op" },
    39703: { message: "too early" },
    40262: { message: "nullifier used" },
    42102: { message: "not collateral" },
    42116: { message: "vote jetton master frozen" },
    42884: { message: "gas error" },
    43072: { message: "wrong wallet" },
    44712: { message: "no shares left" },
    45676: { message: "wrong operation" },
    46257: { message: "Wrong workchain" },
    46613: { message: "turnout below dao baseline" },
    46924: { message: "no jetton wallet" },
    48940: { message: "already unlocked" },
    49043: { message: "no grant" },
    50307: { message: "no user" },
    50912: { message: "bad period" },
    51639: { message: "no sink" },
    52464: { message: "not eligible" },
    52585: { message: "bad request" },
    54228: { message: "voting not finalized" },
    56665: { message: "nullifier required" },
    61686: { message: "access denied" },
    62968: { message: "inactive" },
    63422: { message: "need jetton" },
    63951: { message: "Not next admin" },
} as const

export const ContractVaultDAOv1_errors_backward = {
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
    "stake locked (active vote)": 1483,
    "Incorrect balance after send": 2366,
    "turnout needs total supply": 5083,
    "bad duration": 5419,
    "unknown voting": 6086,
    "bad child": 7814,
    "use ton create": 7856,
    "claimed": 7992,
    "bad dao type": 8447,
    "bad bps": 8928,
    "Incorrect sender": 9215,
    "no wallet": 9542,
    "support below dao baseline": 9748,
    "Unauthorized burn": 10363,
    "no collateral": 10456,
    "voting over": 11186,
    "empty": 12074,
    "bad amount": 12096,
    "insufficient amount": 12119,
    "no dao type": 12168,
    "bad mode": 12286,
    "Not owner": 14534,
    "expired": 15534,
    "vote time is not over": 16693,
    "use jetton create": 17478,
    "too many pending actions": 17495,
    "voting shorter than dao minimum": 17526,
    "use weight source": 18253,
    "amount": 18372,
    "not civic": 19004,
    "locked": 19671,
    "bad citizen count": 20990,
    "Contract is locked": 21196,
    "already bound": 21429,
    "already voted": 23980,
    "no share": 24490,
    "no payload": 26388,
    "no amount": 26501,
    "not a staker": 27104,
    "no citizen count": 27503,
    "voting already registered": 28022,
    "Incoming transfers are locked": 30277,
    "commit": 30779,
    "path pay off": 31019,
    "Insufficient amount of TON attached": 32113,
    "no citizens": 32176,
    "vote time is over": 32290,
    "collateral locked (active vote)": 32347,
    "dust": 33865,
    "no weight cast": 34563,
    "bad fee": 35681,
    "insufficient ton": 35838,
    "wallet already bound": 36784,
    "no destination": 37097,
    "quorum below dao baseline": 38577,
    "nothing to reclaim": 38787,
    "bad op": 38828,
    "too early": 39703,
    "nullifier used": 40262,
    "not collateral": 42102,
    "vote jetton master frozen": 42116,
    "gas error": 42884,
    "wrong wallet": 43072,
    "no shares left": 44712,
    "wrong operation": 45676,
    "Wrong workchain": 46257,
    "turnout below dao baseline": 46613,
    "no jetton wallet": 46924,
    "already unlocked": 48940,
    "no grant": 49043,
    "no user": 50307,
    "bad period": 50912,
    "no sink": 51639,
    "not eligible": 52464,
    "bad request": 52585,
    "voting not finalized": 54228,
    "nullifier required": 56665,
    "access denied": 61686,
    "inactive": 62968,
    "need jetton": 63422,
    "Not next admin": 63951,
} as const

const ContractVaultDAOv1_types: ABIType[] = [
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
    {"name":"ContractLightVotingV1$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"admin","type":{"kind":"simple","type":"address","optional":false}},{"name":"wallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"seqno","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"status","type":{"kind":"simple","type":"uint","optional":false,"format":4}},{"name":"metadata","type":{"kind":"simple","type":"cell","optional":false}},{"name":"settings","type":{"kind":"simple","type":"VoteSettings","optional":false}},{"name":"options","type":{"kind":"dict","key":"address","value":"OptionInfoRoot","valueFormat":"ref"}},{"name":"winner","type":{"kind":"simple","type":"WinnerInfo","optional":false}},{"name":"voted","type":{"kind":"dict","key":"address","value":"bool"}},{"name":"stakes","type":{"kind":"dict","key":"address","value":"uint","valueFormat":"coins"}},{"name":"weightSource","type":{"kind":"simple","type":"address","optional":true}}]},
    {"name":"StakeVote","header":1524301825,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"voting","type":{"kind":"simple","type":"address","optional":false}},{"name":"optionAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"endTime","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"StakeSrcUnstake","header":1524301826,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"RelayStakeVote","header":1524301827,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"voter","type":{"kind":"simple","type":"address","optional":false}},{"name":"voting","type":{"kind":"simple","type":"address","optional":false}},{"name":"optionAddress","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ContractStakeSource$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"voteJettonMaster","type":{"kind":"simple","type":"address","optional":false}},{"name":"wallet","type":{"kind":"simple","type":"address","optional":true}},{"name":"totalStake","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"stakes","type":{"kind":"dict","key":"address","value":"uint","valueFormat":"coins"}},{"name":"lockUntil","type":{"kind":"dict","key":"address","value":"uint","valueFormat":64}},{"name":"voted","type":{"kind":"dict","key":"int","value":"bool"}},{"name":"votings","type":{"kind":"dict","key":"address","value":"uint","valueFormat":64}}]},
    {"name":"CreateCivicDao","header":1524367367,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"metadata","type":{"kind":"simple","type":"cell","optional":false}},{"name":"config","type":{"kind":"simple","type":"DaoConfig","optional":false}},{"name":"params","type":{"kind":"dict","key":"int","value":"DaoParam","valueFormat":"ref"}}]},
    {"name":"RelayCivicGrant","header":1524367368,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"civicSource","type":{"kind":"simple","type":"address","optional":false}},{"name":"voter","type":{"kind":"simple","type":"address","optional":false}},{"name":"voting","type":{"kind":"simple","type":"address","optional":false}},{"name":"expires","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"nullifier","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"weight","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"GrantCivicVote","header":1524367361,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"voter","type":{"kind":"simple","type":"address","optional":false}},{"name":"voting","type":{"kind":"simple","type":"address","optional":false}},{"name":"expires","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"nullifier","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"weight","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"CivicCast","header":1524367362,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"voting","type":{"kind":"simple","type":"address","optional":false}},{"name":"optionAddress","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"RelayCivicCast","header":1524367363,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"voter","type":{"kind":"simple","type":"address","optional":false}},{"name":"voting","type":{"kind":"simple","type":"address","optional":false}},{"name":"optionAddress","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"RelayCivicCastReq","header":1524367369,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"civicSource","type":{"kind":"simple","type":"address","optional":false}},{"name":"voter","type":{"kind":"simple","type":"address","optional":false}},{"name":"voting","type":{"kind":"simple","type":"address","optional":false}},{"name":"optionAddress","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ContractCivicSource$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"verifier","type":{"kind":"simple","type":"address","optional":false}},{"name":"grants","type":{"kind":"dict","key":"int","value":"uint","valueFormat":64}},{"name":"grantWeights","type":{"kind":"dict","key":"int","value":"uint","valueFormat":"coins"}},{"name":"voted","type":{"kind":"dict","key":"int","value":"bool"}},{"name":"nullifiers","type":{"kind":"dict","key":"int","value":"bool"}}]},
    {"name":"CreateWalletDao","header":1524432903,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"metadata","type":{"kind":"simple","type":"cell","optional":false}},{"name":"config","type":{"kind":"simple","type":"DaoConfig","optional":false}},{"name":"params","type":{"kind":"dict","key":"int","value":"DaoParam","valueFormat":"ref"}}]},
    {"name":"WalletCast","header":1524432897,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"voting","type":{"kind":"simple","type":"address","optional":false}},{"name":"optionAddress","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ProveWalletHolding","header":1524432898,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"WalletCastRelay","header":1524432899,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"voter","type":{"kind":"simple","type":"address","optional":false}},{"name":"voting","type":{"kind":"simple","type":"address","optional":false}},{"name":"optionAddress","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ContractWalletSource$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"voteJettonMaster","type":{"kind":"simple","type":"address","optional":false}},{"name":"nftCollection","type":{"kind":"simple","type":"address","optional":true}},{"name":"wallet","type":{"kind":"simple","type":"address","optional":true}},{"name":"eligible","type":{"kind":"dict","key":"address","value":"bool"}},{"name":"voted","type":{"kind":"dict","key":"int","value":"bool"}}]},
    {"name":"CreateCollateralDao","header":1524498439,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"metadata","type":{"kind":"simple","type":"cell","optional":false}},{"name":"config","type":{"kind":"simple","type":"DaoConfig","optional":false}},{"name":"params","type":{"kind":"dict","key":"int","value":"DaoParam","valueFormat":"ref"}}]},
    {"name":"CollateralVote","header":1524498433,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"voting","type":{"kind":"simple","type":"address","optional":false}},{"name":"optionAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"endTime","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"CollateralUnlock","header":1524498434,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"RelayCollateralVote","header":1524498436,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"voter","type":{"kind":"simple","type":"address","optional":false}},{"name":"voting","type":{"kind":"simple","type":"address","optional":false}},{"name":"optionAddress","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SeizeCollateral","header":1524498435,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"user","type":{"kind":"simple","type":"address","optional":false}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ContractCollateralSource$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"voteJettonMaster","type":{"kind":"simple","type":"address","optional":false}},{"name":"wallet","type":{"kind":"simple","type":"address","optional":true}},{"name":"totalLocked","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"locked","type":{"kind":"dict","key":"address","value":"uint","valueFormat":"coins"}},{"name":"lockUntil","type":{"kind":"dict","key":"address","value":"uint","valueFormat":64}},{"name":"voted","type":{"kind":"dict","key":"int","value":"bool"}},{"name":"votings","type":{"kind":"dict","key":"address","value":"uint","valueFormat":64}}]},
    {"name":"PathConfig","header":null,"fields":[{"name":"enabled","type":{"kind":"simple","type":"bool","optional":false}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"quorum","type":{"kind":"simple","type":"uint","optional":false,"format":8}}]},
    {"name":"SetPathConfig","header":1524367376,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"pathId","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"config","type":{"kind":"simple","type":"PathConfig","optional":false}}]},
    {"name":"ClaimCitizenshipPay","header":1524367377,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"passportCommit","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"SetPathPayRules","header":1524367378,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"enabled","type":{"kind":"simple","type":"bool","optional":false}},{"name":"minAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"ContractCitizenshipHub$Data","header":null,"fields":[{"name":"dao","type":{"kind":"simple","type":"address","optional":false}},{"name":"configs","type":{"kind":"dict","key":"int","value":"PathConfig","valueFormat":"ref"}}]},
    {"name":"ContractPathPay$Data","header":null,"fields":[{"name":"dao","type":{"kind":"simple","type":"address","optional":false}},{"name":"hub","type":{"kind":"simple","type":"address","optional":false}},{"name":"enabled","type":{"kind":"simple","type":"bool","optional":false}},{"name":"minAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"wallet","type":{"kind":"simple","type":"address","optional":true}}]},
    {"name":"UnlockPrivatizationFund","header":1524368129,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"totalCitizens","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
    {"name":"ClaimShare","header":1524368130,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"AddPrivatizationClaimant","header":1524368134,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"who","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ContractPrivatizationFund$Data","header":null,"fields":[{"name":"dao","type":{"kind":"simple","type":"address","optional":false}},{"name":"unlocked","type":{"kind":"simple","type":"bool","optional":false}},{"name":"totalShares","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"sharePerCitizen","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"balance","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"wallet","type":{"kind":"simple","type":"address","optional":true}},{"name":"claimed","type":{"kind":"dict","key":"address","value":"bool"}},{"name":"eligible","type":{"kind":"dict","key":"address","value":"bool"}}]},
    {"name":"PushMonthly","header":1524368131,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"ContractLiberationFund$Data","header":null,"fields":[{"name":"dao","type":{"kind":"simple","type":"address","optional":false}},{"name":"budget","type":{"kind":"simple","type":"address","optional":false}},{"name":"balance","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"wallet","type":{"kind":"simple","type":"address","optional":true}},{"name":"lastPush","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"ConfigureTreasuryTopup","header":1524368132,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"mode","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"periodSec","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
    {"name":"PushTreasuryTopup","header":1524368133,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"ContractTreasuryTopupFund$Data","header":null,"fields":[{"name":"dao","type":{"kind":"simple","type":"address","optional":false}},{"name":"balance","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"wallet","type":{"kind":"simple","type":"address","optional":true}},{"name":"lastPush","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"mode","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"periodSec","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"active","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"JettonMinterState","header":null,"fields":[{"name":"totalSupply","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"mintable","type":{"kind":"simple","type":"bool","optional":false}},{"name":"adminAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"jettonContent","type":{"kind":"simple","type":"cell","optional":false}},{"name":"jettonWalletCode","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"GovernanceJettonMinter$Data","header":null,"fields":[{"name":"totalSupply","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"adminAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"nextAdminAddress","type":{"kind":"simple","type":"address","optional":true}},{"name":"jettonContent","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"JettonWalletGovernance$Data","header":null,"fields":[{"name":"status","type":{"kind":"simple","type":"uint","optional":false,"format":4}},{"name":"balance","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"master","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ContractVaultDAOv1$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"status","type":{"kind":"simple","type":"uint","optional":false,"format":4}},{"name":"data","type":{"kind":"simple","type":"OptionInfo","optional":false}}]},
    {"name":"DaoContainerV5$Data","header":null,"fields":[{"name":"master","type":{"kind":"simple","type":"address","optional":false}},{"name":"creator","type":{"kind":"simple","type":"address","optional":false}},{"name":"metadata","type":{"kind":"simple","type":"cell","optional":false}},{"name":"config","type":{"kind":"simple","type":"DaoConfig","optional":false}},{"name":"verified","type":{"kind":"simple","type":"bool","optional":false}},{"name":"voteWallet","type":{"kind":"simple","type":"address","optional":true}},{"name":"votingSeqno","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"actions","type":{"kind":"dict","key":"address","value":"DaoAction","valueFormat":"ref"}},{"name":"params","type":{"kind":"dict","key":"int","value":"DaoParam","valueFormat":"ref"}},{"name":"daoType","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"pendingActions","type":{"kind":"simple","type":"uint","optional":false,"format":16}}]},
]

const ContractVaultDAOv1_opcodes = {
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
    "StakeVote": 1524301825,
    "StakeSrcUnstake": 1524301826,
    "RelayStakeVote": 1524301827,
    "CreateCivicDao": 1524367367,
    "RelayCivicGrant": 1524367368,
    "GrantCivicVote": 1524367361,
    "CivicCast": 1524367362,
    "RelayCivicCast": 1524367363,
    "RelayCivicCastReq": 1524367369,
    "CreateWalletDao": 1524432903,
    "WalletCast": 1524432897,
    "ProveWalletHolding": 1524432898,
    "WalletCastRelay": 1524432899,
    "CreateCollateralDao": 1524498439,
    "CollateralVote": 1524498433,
    "CollateralUnlock": 1524498434,
    "RelayCollateralVote": 1524498436,
    "SeizeCollateral": 1524498435,
    "SetPathConfig": 1524367376,
    "ClaimCitizenshipPay": 1524367377,
    "SetPathPayRules": 1524367378,
    "UnlockPrivatizationFund": 1524368129,
    "ClaimShare": 1524368130,
    "AddPrivatizationClaimant": 1524368134,
    "PushMonthly": 1524368131,
    "ConfigureTreasuryTopup": 1524368132,
    "PushTreasuryTopup": 1524368133,
}

const ContractVaultDAOv1_getters: ABIGetter[] = [
    {"name":"info","methodId":71178,"arguments":[],"returnType":{"kind":"simple","type":"OptionInfo","optional":false}},
]

export const ContractVaultDAOv1_getterMapping: { [key: string]: string } = {
    'info': 'getInfo',
}

const ContractVaultDAOv1_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"VaultInitialization"}},
]

export const minVotingCreationFee = 250000000n;
export const minVotingActivationFee = 25000000n;
export const votingDeployValue = 20000000n;
export const minVotingCreateTon = 50000000n;
export const minMoneyVotingCreateTon = 300000000n;
export const containerDeployValue = 300000000n;
export const containerDeployValueWeight = 450000000n;
export const containerDeployValueCivic = 900000000n;
export const maxPendingActions = 64n;
export const tonPayoutReserve = 100000000n;
export const maxCitizensSnapshot = 1000000n;
export const Workchain = 0n;
export const MyWorkchain = false;
export const minTonsForStorage = 10000000n;
export const gasForTransfer = 10200n;
export const gasForBurn = 7500n;
export const walletStateInitCells = 30n;
export const walletStateInitBits = 20000n;

export class ContractVaultDAOv1 implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = ContractVaultDAOv1_errors_backward;
    public static readonly opcodes = ContractVaultDAOv1_opcodes;
    
    static async init(owner: Address, status: bigint, data: OptionInfo) {
        return await ContractVaultDAOv1_init(owner, status, data);
    }
    
    static async fromInit(owner: Address, status: bigint, data: OptionInfo) {
        const __gen_init = await ContractVaultDAOv1_init(owner, status, data);
        const address = contractAddress(0, __gen_init);
        return new ContractVaultDAOv1(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new ContractVaultDAOv1(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  ContractVaultDAOv1_types,
        getters: ContractVaultDAOv1_getters,
        receivers: ContractVaultDAOv1_receivers,
        errors: ContractVaultDAOv1_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: VaultInitialization) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'VaultInitialization') {
            body = beginCell().store(storeVaultInitialization(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getInfo(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('info', builder.build())).stack;
        const result = loadGetterTupleOptionInfo(source);
        return result;
    }
    
}