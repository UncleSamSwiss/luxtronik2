/**
 * @module luxtronik2
 * @copyright Sebastian B. <coolchip@gmx.de>
 */

'use strict';

const net = require('net');

const utils = require('./utils');
const types = require('./types');

function Luxtronik(host, port) {
    if (!(this instanceof Luxtronik)) {
        return new Luxtronik(host, port);
    }

    if (typeof port === 'undefined') {
        this._port = 8888;
    } else {
        this._port = port;
    }
    this._host = host;
    this.receivy = {};
}

function processValues(heatpumpValues, heatpumpVisibility) {
    return {
        'temperature_supply': heatpumpValues[10] / 10, // #15
        'temperature_return': heatpumpValues[11] / 10, // #16
        'temperature_target_return': heatpumpValues[12] / 10, // #17
        'temperature_extern_return': (heatpumpVisibility[24] === 1) ? heatpumpValues[13] / 10 : 'no', // #18
        'temperature_hot_gas': heatpumpValues[14] / 10, // #26
        'temperature_outside': heatpumpValues[15] / 10, // #12
        'temperature_outside_avg': heatpumpValues[16] / 10, // #13
        'temperature_hot_water': heatpumpValues[17] / 10, // #14
        'temperature_hot_water_target': heatpumpValues[18] / 10, // #25
        'temperature_heat_source_in': heatpumpValues[19] / 10, // #23
        'temperature_heat_source_out': heatpumpValues[20] / 10, // #24
        'temperature_mixer1_flow': (heatpumpVisibility[31] === 1) ? heatpumpValues[21] / 10 : 'no', // #55
        'temperature_mixer1_target': (heatpumpVisibility[32] === 1) ? heatpumpValues[22] / 10 : 'no', // #56
        'temperaturw_RFV': (heatpumpVisibility[33] === 1) ? heatpumpValues[23] / 10 : 'no',
        'temperature_mixer2_flow': (heatpumpVisibility[34] === 1) ? heatpumpValues[24] / 10 : 'no', // #57
        'temperature_mixer2_target': (heatpumpVisibility[35] === 1) ? heatpumpValues[25] / 10 : 'no', // #48
        'temperature_solar_collector': (heatpumpVisibility[36] === 1) ? heatpumpValues[26] / 10 : 'no', // #50
        'temperature_solar_storage': (heatpumpVisibility[37] === 1) ? heatpumpValues[27] / 10 : 'no', // #51
        'temperature_external_source': (heatpumpVisibility[38] === 1) ? heatpumpValues[28] / 10 : 'no',

        'ASDin': heatpumpValues[29],
        'BWTin': heatpumpValues[30],
        'EVUin': heatpumpValues[31],
        'HDin': heatpumpValues[32],
        'MOTin': heatpumpValues[33],
        'NDin': heatpumpValues[34],
        'PEXin': heatpumpValues[35],
        'SWTin': heatpumpValues[36],

        'AVout': heatpumpValues[37],
        'BUPout': heatpumpValues[38],
        'HUPout': heatpumpValues[39],
        'MA1out': heatpumpValues[40],
        'MZ1out': heatpumpValues[41],
        'VENout': heatpumpValues[42],
        'VBOout': heatpumpValues[43],
        'VD1out': heatpumpValues[44],
        'VD2out': heatpumpValues[45],
        'ZIPout': heatpumpValues[46],
        'ZUPout': heatpumpValues[47],
        'ZW1out': heatpumpValues[48],
        'ZW2SSTout': heatpumpValues[49],
        'ZW3SSTout': heatpumpValues[50],
        'FP2out': heatpumpValues[51],
        'SLPout': heatpumpValues[52],
        'SUPout': heatpumpValues[53],
        'MZ2out': heatpumpValues[54],
        'MA2out': heatpumpValues[55],

        'defrostValve': (heatpumpVisibility[47] === 1) ? heatpumpValues[37] : 'no', // #67
        'hotWaterBoilerValve': heatpumpValues[38], // #9
        'heatingSystemCircPump': (heatpumpValues[39] === 1) ? 'on' : 'off', // #27

        'heatSourceMotor': (heatpumpVisibility[54] === 1) ? heatpumpValues[43] : 'no', // #64
        'compressor1': heatpumpValues[44],

        'hotWaterCircPumpExtern': (heatpumpVisibility[57] === 1) ? heatpumpValues[46] : 'no', // #28

        'hours_compressor1': Math.round(heatpumpValues[56] / 3600),
        'starts_compressor1': heatpumpValues[57],
        'hours_compressor2': Math.round(heatpumpValues[58] / 3600),
        'starts_compressor2': heatpumpValues[59],
        'hours_2nd_heat_source1': (heatpumpVisibility[84] === 1) ? Math.round(heatpumpValues[60] / 3600) : 'no', // #32
        'hours_2nd_heat_source2': (heatpumpVisibility[85] === 1) ? Math.round(heatpumpValues[61] / 3600) : 'no', // #38
        'hours_2nd_heat_source3': (heatpumpVisibility[86] === 1) ? Math.round(heatpumpValues[62] / 3600) : 'no', // #39
        'hours_heatpump': (heatpumpVisibility[87] === 1) ? Math.round(heatpumpValues[63] / 3600) : 'no', // #33
        'hours_heating': (heatpumpVisibility[195] === 1) ? Math.round(heatpumpValues[64] / 3600) : 'no', // #34
        'hours_warmwater': (heatpumpVisibility[196] === 1) ? Math.round(heatpumpValues[65] / 3600) : 'no', // #35
        'hours_cooling': (heatpumpVisibility[197] === 1) ? Math.round(heatpumpValues[66] / 3600) : 'no',

        'Time_WPein_akt': heatpumpValues[67],
        'Time_ZWE1_akt': heatpumpValues[68],
        'Time_ZWE2_akt': heatpumpValues[69],
        'Timer_EinschVerz': heatpumpValues[70],
        'Time_SSPAUS_akt': heatpumpValues[71],
        'Time_SSPEIN_akt': heatpumpValues[72],
        'Time_VDStd_akt': heatpumpValues[73],
        'Time_HRM_akt': heatpumpValues[74],
        'Time_HRW_akt': heatpumpValues[75],
        'Time_LGS_akt': heatpumpValues[76],
        'Time_SBW_akt': heatpumpValues[77],

        'typeHeatpump': utils.createHeatPumptTypeString(heatpumpValues[78]), // #31
        'bivalentLevel': heatpumpValues[79], // #43

        'WP_BZ_akt': heatpumpValues[80],

        'firmware': utils.createFirmwareString(heatpumpValues.slice(81, 91)), // #20

        'AdresseIP_akt': utils.int2ipAddress(heatpumpValues[91]),
        'SubNetMask_akt': utils.int2ipAddress(heatpumpValues[92]),
        'Add_Broadcast': utils.int2ipAddress(heatpumpValues[93]),
        'Add_StdGateway': utils.int2ipAddress(heatpumpValues[94]),

        'errors': utils.createErrorCodeList(heatpumpValues.slice(95, 100), heatpumpValues.slice(100, 105)), // #42 Time of first error

        'error_count': heatpumpValues[105],

        'switch_off': utils.createOutageCodeList(heatpumpValues.slice(111, 116), heatpumpValues.slice(106, 111)),

        'Comfort_exists': heatpumpValues[116],

        'heatpump_state1': heatpumpValues[117],
        'heatpump_state2': heatpumpValues[118], // #40
        'heatpump_state3': heatpumpValues[119],
        'heatpump_duration': heatpumpValues[120], // #41
        'heatpump_state_string': utils.createStateString(heatpumpValues),
        'heatpump_extendet_state_string': utils.createExtendedStateString(heatpumpValues),

        'ahp_Stufe': heatpumpValues[121],
        'ahp_Temp': heatpumpValues[122],
        'ahp_Zeit': heatpumpValues[123],

        'opStateHotWater': heatpumpValues[124], // #8
        'opStateHotWaterString': utils.createHotWaterStateString(heatpumpValues),
        'opStateHeating': heatpumpValues[125], // #46
        'opStateMixer1': heatpumpValues[126],
        'opStateMixer2': heatpumpValues[127],
        'Einst_Kurzprogramm': heatpumpValues[128],
        'StatusSlave_1': heatpumpValues[129],
        'StatusSlave_2': heatpumpValues[130],
        'StatusSlave_3': heatpumpValues[131],
        'StatusSlave_4': heatpumpValues[132],
        'StatusSlave_5': heatpumpValues[133],

        'rawDeviceTimeCalc': new Date(heatpumpValues[134] * 1000).toString(), // #22

        'opStateMixer3': heatpumpValues[135],
        'temperature_mixer3_target': (heatpumpVisibility[211] === 1) ? heatpumpValues[136] / 10 : 'no', // #60
        'temperature_mixer3_flow': (heatpumpVisibility[210] === 1) ? heatpumpValues[137] / 10 : 'no', // #59

        'MZ3out': heatpumpValues[138],
        'MA3out': heatpumpValues[139],
        'FP3out': heatpumpValues[140],

        'heatSourceDefrostTimer': (heatpumpVisibility[219] === 1) ? heatpumpValues[141] : 'no', // #66

        'Temperatur_RFV2': heatpumpValues[142] / 10,
        'Temperatur_RFV3': heatpumpValues[143] / 10,
        'SH_SW': heatpumpValues[144],
        'Zaehler_BetrZeitSW': Math.round(heatpumpValues[145] / 3600),
        'FreigabKuehl': heatpumpValues[146],
        'AnalogIn': heatpumpValues[147],
        'SonderZeichen': heatpumpValues[148],
        'SH_ZIP': heatpumpValues[149],
        'WebsrvProgrammWerteBeobarten': heatpumpValues[150],

        'thermalenergy_heating': (heatpumpVisibility[0] === 1) ? heatpumpValues[151] / 10 : 'no', // #36
        'thermalenergy_warmwater': (heatpumpVisibility[1] === 1) ? heatpumpValues[152] / 10 : 'no', // #37
        'thermalenergy_pool': (heatpumpVisibility[2] === 1) ? heatpumpValues[153] / 10 : 'no', // #62
        'thermalenergy_total': heatpumpValues[154] / 10,

        'analogOut1': heatpumpValues[156],
        'analogOut2': heatpumpValues[157],
        'Time_Heissgas': heatpumpValues[158],
        'Temp_Lueftung_Zuluft': heatpumpValues[159] / 10,
        'Temp_Lueftung_Abluft': heatpumpValues[160] / 10,

        'hours_solar': (heatpumpVisibility[248] === 1) ? Math.round(heatpumpValues[161] / 3600) : 'no', // #52
        'analogOut3': heatpumpValues[162],
        'analogOut4': (heatpumpVisibility[267] === 1) ? heatpumpValues[163] : 'no', // #73 - Voltage heating system circulation pump

        'Out_VZU': heatpumpValues[164],
        'Out_VAB': heatpumpValues[165],
        'Out_VSK': heatpumpValues[166],
        'Out_FRH': heatpumpValues[167],
        'AnalogIn2': heatpumpValues[168],
        'AnalogIn3': heatpumpValues[169],
        'SAXin': heatpumpValues[170],
        'SPLin': heatpumpValues[171],
        'Compact_exists': heatpumpValues[172],
        'Durchfluss_WQ': heatpumpValues[173],
        'LIN_exists': heatpumpValues[174],
        'LIN_TUE': heatpumpValues[175],
        'LIN_TUE1': heatpumpValues[176],
        'LIN_VDH': heatpumpValues[177],
        'LIN_UH': heatpumpValues[178],
        'LIN_UH_Soll': heatpumpValues[179],
        'LIN_HD': heatpumpValues[180],
        'LIN_ND': heatpumpValues[181],
        'LIN_VDH_out': heatpumpValues[182]
    };
}

function processParameters(heatpumpParameters, heatpumpVisibility) {
    return {
        'heating_temperature': heatpumpParameters[1] / 10, // #54 - returnTemperatureSetBack
        'warmwater_temperature': heatpumpParameters[2] / 10,
        'heating_operation_mode': heatpumpParameters[3], // #10
        'warmwater_operation_mode': heatpumpParameters[4], // #7

        'heating_operation_mode_string': utils.createOperationStateString(heatpumpParameters[3]),
        'warmwater_operation_mode_string': utils.createOperationStateString(heatpumpParameters[4]),

        'heating_curve_end_point': (heatpumpVisibility[207] === 1) ? heatpumpParameters[11] / 10 : 'no', // #69
        'heating_curve_parallel_offset': (heatpumpVisibility[207] === 1) ? heatpumpParameters[12] / 10 : 'no', // #70
        'deltaHeatingReduction': heatpumpParameters[13] / 10, // #47

        'heatSourcedefrostAirThreshold': (heatpumpVisibility[97] === 1) ? heatpumpParameters[44] / 10 : 'no', // #71

        'hotWaterTemperatureHysterese': heatpumpParameters[74] / 10, // #49

        'returnTempHyst': (heatpumpVisibility[93] === 1) ? heatpumpParameters[88] / 10 : 'no', // #68

        'heatSourcedefrostAirEnd': (heatpumpVisibility[105] === 1) ? heatpumpParameters[98] / 10 : 'no', // #72

        'temperature_hot_water_target': heatpumpParameters[105] / 10,

        'cooling_operation_mode': heatpumpParameters[108],

        'cooling_release_temperature': heatpumpParameters[110] / 10,
        'thresholdTemperatureSetBack': heatpumpParameters[111] / 10, // #48

        'cooling_inlet_temp': heatpumpParameters[132] / 10,

        'hotWaterCircPumpDeaerate': (heatpumpVisibility[167] === 1) ? heatpumpParameters[684] : 'no', // #61

        'heatingLimit': heatpumpParameters[699], // #11
        'thresholdHeatingLimit': heatpumpParameters[700] / 10, // #21

        'cooling_start_after_hours': heatpumpParameters[850],
        'cooling_stop_after_hours': heatpumpParameters[851],

        'typeSerial': heatpumpParameters[874].toString().substr(0, 4) + '/' + heatpumpParameters[874].toString().substr(4) + '-' + heatpumpParameters[875].toString(16).toUpperCase(),

        'returnTemperatureTargetMin': heatpumpParameters[979] / 10 // #63

        // "possible_temperature_hot_water_limit1": heatpumpParameters[47] / 10,
        // "possible_temperature_hot_water_limit2": heatpumpParameters[84] / 10,
        // "possible_temperature_hot_water_limit3": heatpumpParameters[973] / 10,
    };
}

Luxtronik.prototype._processData = function () {
    const heatpumpParameters = utils.toInt32ArrayReadBE(this.receivy['3003'].payload);
    const heatpumpValues = utils.toInt32ArrayReadBE(this.receivy['3004'].payload);
    const heatpumpVisibility = this.receivy['3005'].payload;

    if (typeof heatpumpParameters === 'undefined' ||
        typeof heatpumpValues === 'undefined' ||
        typeof heatpumpVisibility === 'undefined') {
        return this.receivy.callback(new Error('Unexpected Data'));
    }
    if (this.receivy.rawdata) {
        return this.receivy.callback(null, {
            values: '[' + heatpumpValues + ']',
            parameters: '[' + heatpumpParameters + ']'
        });
    }

    const values = processValues(heatpumpValues, heatpumpVisibility);
    const parameters = processParameters(heatpumpParameters, heatpumpVisibility);
    const additional = {
        'reading_calculated_time_ms': this.receivy.readingEndTime - this.receivy.readingStartTime
    };

    // flow rate
    values.flowRate = (heatpumpParameters[870] !== 0) ? heatpumpValues[155] : 'no'; // #19

    // skips inconsistent flow rates (known problem of the used flow measurement devices)
    if (values.flowRate !== 'no' && values.heatingSystemCircPump === 'on') {
        if (values.flowRate === 0) {
            values.flowRate = 'inconsistent';
        }
    }

    if (parameters.hotWaterCircPumpDeaerate !== 'no') {
        parameters.hotWaterCircPumpDeaerate = parameters.hotWaterCircPumpDeaerate ? 'on' : 'off';
    }

    // Consider also heating limit
    let heatingStateString = '';
    if (parameters.heating_operation_mode === 0 && parameters.heatingLimit === 1 &&
        values.temperature_outside_avg >= parameters.thresholdHeatingLimit &&
        (values.temperature_target_return === parameters.returnTemperatureTargetMin ||
            values.temperature_target_return === 20 && values.temperature_outside < 10)
    ) {
        if (values.temperature_outside >= 10) {
            heatingStateString = 'Heizgrenze (Soll ' + parameters.returnTemperatureTargetMin + ' °C)';
        } else {
            heatingStateString = 'Frostschutz (Soll 20 °C)';
        }
    } else {
        if (types.heatingState.hasOwnProperty(values.opStateHeating)) {
            heatingStateString = types.heatingState[values.opStateHeating];
        } else {
            heatingStateString = 'unbekannt (' + values.opStateHeating + ')';
        }

        // Consider heating reduction limit
        if (values.opStateHeating === 0) {
            if (parameters.thresholdTemperatureSetBack <= values.temperature_outside) {
                heatingStateString += ' ' + parameters.deltaHeatingReduction + ' °C';
            } else {
                heatingStateString = 'Normal da < ' + parameters.thresholdTemperatureSetBack + ' °C';
            }
        }
    }
    values.opStateHeatingString = heatingStateString;

    return this.receivy.callback(null, {
        values,
        parameters,
        additional
    });
};

function sendData(client, data) {
    if (typeof client !== 'undefined' && client !== null) {
        data.forEach(function (element) {
            const buffer = Buffer.allocUnsafe(4);
            buffer.writeInt32BE(element);
            client.write(buffer);
        });
    }
}

Luxtronik.prototype._nextJob = function () {
    if (this.receivy.jobs.length > 0) {
        this.receivy.activeCommand = 0;
        sendData(this.client, [this.receivy.jobs.shift(), 0]);
    } else {
        this.client.end();
        this.client = null;
        this.receivy.readingEndTime = Date.now();
        process.nextTick(this._processData.bind(this));
    }
};

Luxtronik.prototype._startRead = function (rawdata, callback) {
    this.receivy = {
        jobs: [3003, 3004, 3005],
        activeCommand: 0,
        readingStartTime: Date.now(),
        rawdata,
        callback
    };

    this.client = net.createConnection({
        host: this._host,
        port: this._port
    }, function () {
        process.nextTick(this._nextJob.bind(this));
    }.bind(this));

    this.client.on('error', function (error) {
        this.client.end();
        this.client = null;
        process.nextTick(
            function () {
                this.receivy.callback(error);
            }.bind(this)
        );
    }.bind(this));

    this.client.on('data', function (data) {
        if (this.receivy.activeCommand === 0) {
            const commandEcho = data.readInt32BE(0);
            let firstReadableDataAddress = 0;

            if (commandEcho === 3004) {
                const status = data.readInt32BE(4);
                if (status > 0) {
                    // Parameter on target changed, restart parameter reading after 5 seconds
                    this.client.end();
                    this.client = null;
                    return process.nextTick(
                        function () {
                            this.receivy.callback(new Error('heatpump busy'));
                        }.bind(this)
                    );
                } else {
                    firstReadableDataAddress = 12;
                }
            } else {
                firstReadableDataAddress = 8;
            }
            const paramCount = data.readInt32BE(firstReadableDataAddress - 4);
            let dataCount = 0;
            if (commandEcho === 3005) {
                // 8 Bit values
                dataCount = paramCount;
            } else {
                // 32 Bit values
                dataCount = paramCount * 4;
            }
            const payload = data.slice(firstReadableDataAddress, data.length);

            this.receivy.activeCommand = commandEcho;
            this.receivy[commandEcho] = {
                remaining: dataCount - payload.length,
                payload
            };
        } else {
            this.receivy[this.receivy.activeCommand] = {
                remaining: this.receivy[this.receivy.activeCommand].remaining - data.length,
                payload: Buffer.concat([this.receivy[this.receivy.activeCommand].payload, data])
            };
        }

        if (this.receivy[this.receivy.activeCommand].remaining <= 0) {
            process.nextTick(this._nextJob.bind(this));
        }
    }.bind(this));

    this.client.on('close', function () {});
};

Luxtronik.prototype._startWrite = function (setParameter, setValue, callback) {
    this.client = net.createConnection({
        host: this._host,
        port: this._port
    }, function () {
        const command = 3002;
        sendData(this.client, [command, setParameter, setValue]);
    }.bind(this));

    this.client.on('error', function (error) {
        process.nextTick(
            function () {
                callback(error);
            }
        );
        this.client.end();
        this.client = null;
    }.bind(this));

    this.client.on('data', function (data) {
        const commandEcho = data.readInt32BE(0);
        let next;
        if (commandEcho !== 3002) {
            const error = 'Host did not confirm parameter setting';
            next = function () {
                callback(error);
            };
        } else {
            const setParameterEcho = data.readInt32BE(4);
            next = function () {
                callback(null, {
                    msg: 'write ok',
                    echo: setParameterEcho
                });
            };
        }
        process.nextTick(next);
        this.client.end();
        this.client = null;
    }.bind(this));
};

Luxtronik.prototype._handleWriteCommand = function (parameterName, realValue, callback) {
    const writeParameters = Object.freeze({
        'heating_target_temperature': {
            setParameter: 1,
            setValue: utils.value2LuxtronikSetValue(utils.limitRange(realValue, -10, 10))
        },
        'warmwater_target_temperature': {
            setParameter: 2,
            setValue: utils.value2LuxtronikSetValue(utils.limitRange(realValue, 30, 65))
        },
        'heating_operation_mode': {
            setParameter: utils.isValidOperationMode(realValue) ? 3 : undefined,
            setValue: realValue
        },
        'warmwater_operation_mode': {
            setParameter: utils.isValidOperationMode(realValue) ? 4 : undefined,
            setValue: realValue
        },
        'cooling_operation_mode': {
            setParameter: 108,
            setValue: realValue
        },
        'cooling_release_temp': {
            setParameter: 110,
            setValue: utils.value2LuxtronikSetValue(realValue)
        },
        'cooling_inlet_temp': {
            setParameter: 132,
            setValue: utils.value2LuxtronikSetValue(realValue)
        },
        'cooling_start': {
            setParameter: 850,
            setValue: realValue
        },
        'cooling_stop': {
            setParameter: 851,
            setValue: realValue
        },
        'wrongName': {
            //setParameter: undefined,
        }
    });

    const set = writeParameters.hasOwnProperty(parameterName) ? writeParameters[parameterName] : writeParameters.wrongName;
    if (typeof set.setParameter !== 'undefined') {
        const setParameter = set.setParameter;
        const setValue = set.setValue;
        this._startWrite(setParameter, setValue, callback);
    } else {
        const error = 'Wrong data';
        process.nextTick(
            function () {
                callback(error);
            }
        );
    }
};

Luxtronik.prototype.read = function (rawdata, callback) {
    if (rawdata instanceof Function) {
        callback = rawdata;
        rawdata = false;
    }
    this._startRead(rawdata, callback);
};

Luxtronik.prototype.readRaw = function (callback) {
    this._startRead(true, callback);
};

Luxtronik.prototype.write = function (parameterName, realValue, callback) {
    if (typeof callback === 'undefined') {
        callback = function () {};
    }
    this._handleWriteCommand(parameterName, realValue, callback);
};

const createConnection = function (host, port) {
    return new Luxtronik(host, port);
};

module.exports.createConnection = createConnection;
