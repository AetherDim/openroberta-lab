package de.fhg.iais.roberta.visitor.hardware;

import de.fhg.iais.roberta.syntax.action.motor.MotorGetPowerAction;
import de.fhg.iais.roberta.syntax.action.motor.MotorSetPowerAction;
import de.fhg.iais.roberta.syntax.action.motor.MotorStopAction;
import de.fhg.iais.roberta.syntax.action.sound.PlayFileAction;
import de.fhg.iais.roberta.syntax.action.sound.PlayNoteAction;
import de.fhg.iais.roberta.syntax.action.sound.VolumeAction;
import de.fhg.iais.roberta.syntax.actors.arduino.RelayAction;
import de.fhg.iais.roberta.syntax.actors.arduino.sensebox.PlotClearAction;
import de.fhg.iais.roberta.syntax.actors.arduino.sensebox.PlotPointAction;
import de.fhg.iais.roberta.syntax.actors.arduino.sensebox.SendDataAction;
import de.fhg.iais.roberta.syntax.neuralnetwork.NeuralNetworkAddRawData;
import de.fhg.iais.roberta.syntax.neuralnetwork.NeuralNetworkClassify;
import de.fhg.iais.roberta.syntax.neuralnetwork.NeuralNetworkNew;
import de.fhg.iais.roberta.syntax.neuralnetwork.NeuralNetworkTrain;
import de.fhg.iais.roberta.syntax.neuralnetwork.NeuralNetworkTrainingOfClass;
import de.fhg.iais.roberta.syntax.sensors.arduino.nano33blesense.Apds9960ColorSensor;
import de.fhg.iais.roberta.syntax.sensors.arduino.nano33blesense.Apds9960DistanceSensor;
import de.fhg.iais.roberta.syntax.sensors.arduino.nano33blesense.Apds9960GestureSensor;
import de.fhg.iais.roberta.syntax.sensors.arduino.nano33blesense.Hts221HumiditySensor;
import de.fhg.iais.roberta.syntax.sensors.arduino.nano33blesense.Hts221TemperatureSensor;
import de.fhg.iais.roberta.syntax.sensors.arduino.nano33blesense.Lps22hbPressureSensor;
import de.fhg.iais.roberta.syntax.sensors.arduino.nano33blesense.Lsm9ds1AccSensor;
import de.fhg.iais.roberta.syntax.sensors.arduino.nano33blesense.Lsm9ds1GyroSensor;
import de.fhg.iais.roberta.syntax.sensors.arduino.nano33blesense.Lsm9ds1MagneticFieldSensor;
import de.fhg.iais.roberta.syntax.sensors.arduino.sensebox.EnvironmentalSensor;
import de.fhg.iais.roberta.syntax.sensors.arduino.sensebox.GpsSensor;
import de.fhg.iais.roberta.util.dbc.DbcException;
import de.fhg.iais.roberta.visitor.hardware.actor.IDisplayVisitor;
import de.fhg.iais.roberta.visitor.hardware.actor.ILightVisitor;
import de.fhg.iais.roberta.visitor.hardware.actor.IMotorVisitor;
import de.fhg.iais.roberta.visitor.hardware.actor.IPinVisitor;
import de.fhg.iais.roberta.visitor.hardware.actor.ISerialVisitor;
import de.fhg.iais.roberta.visitor.hardware.actor.ISoundVisitor;
import de.fhg.iais.roberta.visitor.hardware.sensor.ISensorVisitor;

public interface IArduinoVisitor<V>
    extends IMotorVisitor<V>, IDisplayVisitor<V>, ISoundVisitor<V>, ILightVisitor<V>, ISensorVisitor<V>, ISerialVisitor<V>, IPinVisitor<V> {

    default V visitRelayAction(RelayAction<V> relayAction) {
        throw new DbcException("Block is not implemented!");
    }

    default V visitDataSendAction(SendDataAction<V> sendDataAction) {
        throw new DbcException("Block is not implemented!");
    }

    default V visitPlotPointAction(PlotPointAction<V> plotPointAction) {
        throw new DbcException("Block is not implemented!");
    }

    default V visitPlotClearAction(PlotClearAction<V> plotClearAction) {
        throw new DbcException("Block is not implemented!");
    }

    default V visitGpsSensor(GpsSensor<V> gpsSensor) {
        throw new DbcException("Block is not implemented!");
    }

    default V visitEnvironmentalSensor(EnvironmentalSensor<V> environmentalSensor) {
        throw new DbcException("Block is not implemented!");
    }

    @Override
    default V visitPlayFileAction(PlayFileAction<V> playFileAction) {
        throw new DbcException("Not supported!");
    }

    @Override
    default V visitVolumeAction(VolumeAction<V> volumeAction) {
        throw new DbcException("Not supported!");
    }

    @Override
    default V visitPlayNoteAction(PlayNoteAction<V> playNoteAction) {
        throw new DbcException("Not supported!");
    }

    @Override
    default V visitMotorSetPowerAction(MotorSetPowerAction<V> motorSetPowerAction) {
        throw new DbcException("Not supported!");
    }

    @Override
    default V visitMotorGetPowerAction(MotorGetPowerAction<V> motorGetPowerAction) {
        throw new DbcException("Not supported!");
    }

    @Override
    default V visitMotorStopAction(MotorStopAction<V> motorStopAction) {
        throw new DbcException("Not supported!");
    }

    default V visitLsm9ds1AccSensor(Lsm9ds1AccSensor<V> sensor) {
        throw new DbcException("Not supported!");
    }

    default V visitLsm9ds1GyroSensor(Lsm9ds1GyroSensor<V> sensor) {
        throw new DbcException("Not supported!");
    }

    default V visitLsm9ds1MagneticFieldSensor(Lsm9ds1MagneticFieldSensor<V> sensor) {
        throw new DbcException("Not supported!");
    }

    default V visitApds9960DistanceSensor(Apds9960DistanceSensor<V> sensor) {
        throw new DbcException("Not supported!");
    }

    default V visitApds9960GestureSensor(Apds9960GestureSensor<V> sensor) {
        throw new DbcException("Not supported!");
    }

    default V visitApds9960ColorSensor(Apds9960ColorSensor<V> sensor) {
        throw new DbcException("Not supported!");
    }

    default V visitLps22hbPressureSensor(Lps22hbPressureSensor<V> sensor) {
        throw new DbcException("Not supported!");
    }

    default V visitHts221TemperatureSensor(Hts221TemperatureSensor<V> sensor) {
        throw new DbcException("Not supported!");
    }

    default V visitHts221HumiditySensor(Hts221HumiditySensor<V> sensor) {
        throw new DbcException("Not supported!");
    }

    default V visitNeuralNetworkNew(NeuralNetworkNew<V> nn) {
        throw new DbcException("Not supported!");
    }

    default V visitNeuralNetworkTrainingOfClass(NeuralNetworkTrainingOfClass<V> nn) {
        throw new DbcException("Not supported!");
    }

    default V visitNeuralNetworkAddRawData(NeuralNetworkAddRawData<V> nn) {
        throw new DbcException("Not supported!");
    }

    default V visitNeuralNetworkTrain(NeuralNetworkTrain<V> nn) {
        throw new DbcException("Not supported!");
    }

    default V visitNeuralNetworkClassify(NeuralNetworkClassify<V> nn) {
        throw new DbcException("Not supported!");
    }
}
