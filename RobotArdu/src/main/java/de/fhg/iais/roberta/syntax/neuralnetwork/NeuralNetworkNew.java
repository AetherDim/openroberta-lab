package de.fhg.iais.roberta.syntax.neuralnetwork;

import java.util.List;

import de.fhg.iais.roberta.blockly.generated.Block;
import de.fhg.iais.roberta.blockly.generated.Value;
import de.fhg.iais.roberta.syntax.BlockTypeContainer;
import de.fhg.iais.roberta.syntax.BlocklyBlockProperties;
import de.fhg.iais.roberta.syntax.BlocklyComment;
import de.fhg.iais.roberta.syntax.Phrase;
import de.fhg.iais.roberta.syntax.lang.expr.Expr;
import de.fhg.iais.roberta.syntax.lang.stmt.Stmt;
import de.fhg.iais.roberta.transformer.AbstractJaxb2Ast;
import de.fhg.iais.roberta.transformer.Ast2JaxbHelper;
import de.fhg.iais.roberta.transformer.ExprParam;
import de.fhg.iais.roberta.typecheck.BlocklyType;
import de.fhg.iais.roberta.visitor.IVisitor;
import de.fhg.iais.roberta.visitor.hardware.IArduinoVisitor;

public class NeuralNetworkNew<V> extends Stmt<V> {
    private Expr<V> numberOfClasses;

    private NeuralNetworkNew(Expr<V> numberOfClasses, BlocklyBlockProperties properties, BlocklyComment comment) {
        super(BlockTypeContainer.getByName("NEURAL_NETWORK_NEW"), properties, comment);
        this.numberOfClasses = numberOfClasses;
        setReadOnly();
    }

    public static <V> NeuralNetworkNew<V> make(Expr<V> numberOfClasses, BlocklyBlockProperties properties, BlocklyComment comment) {
        return new NeuralNetworkNew<>(numberOfClasses, properties, comment);
    }

    /**
     * @return the number of classes of this neural network (it's an classifier network)
     */
    public Expr<V> getNumberOfClasses() {
        return this.numberOfClasses;
    }

    @Override
    public String toString() {
        return new StringBuilder().append("NeuralNetworkNew [ ").append(this.numberOfClasses).append("]").toString();
    }

    @Override
    protected V acceptImpl(IVisitor<V> visitor) {
        return ((IArduinoVisitor<V>) visitor).visitNeuralNetworkNew(this);

    }

    /**
     * Transformation from JAXB object to corresponding AST object.
     *
     * @param block for transformation
     * @param helper class for making the transformation
     * @return corresponding AST object
     */
    public static <V> Phrase<V> jaxbToAst(Block block, AbstractJaxb2Ast<V> helper) {
        List<Value> values = AbstractJaxb2Ast.extractValues(block, (short) 1);
        Phrase<V> p = helper.extractValue(values, new ExprParam("NUMBEROFCLASSES", BlocklyType.CAPTURED_TYPE));
        Expr<V> numberOfClasses = helper.convertPhraseToExpr(p);
        return NeuralNetworkNew.make(numberOfClasses, AbstractJaxb2Ast.extractBlockProperties(block), AbstractJaxb2Ast.extractComment(block));
    }

    @Override
    public Block astToBlock() {
        Block jaxbDestination = new Block();
        Ast2JaxbHelper.setBasicProperties(this, jaxbDestination);
        Ast2JaxbHelper.addValue(jaxbDestination, "NUMBEROFCLASSES", getNumberOfClasses());
        return jaxbDestination;
    }
}
