package de.fhg.iais.roberta.visitor.hardware;

import de.fhg.iais.roberta.syntax.neuralnetwork.*;
import de.fhg.iais.roberta.util.dbc.DbcException;

public interface INeuralNetworkVisitor<V> {
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
