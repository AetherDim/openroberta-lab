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

public class NeuralNetworkAddRawData<V> extends Stmt<V> {
    private Expr<V> x, y, z;

    private NeuralNetworkAddRawData(Expr<V> x, Expr<V> y, Expr<V> z, BlocklyBlockProperties properties, BlocklyComment comment) {
        super(BlockTypeContainer.getByName("NEURAL_NETWORK_ADD_RAW_DATA"), properties, comment);
        this.x = x;
        this.y = y;
        this.z = z;
        setReadOnly();
    }

    public static <V> NeuralNetworkAddRawData<V> make(Expr<V> x, Expr<V> y, Expr<V> z, BlocklyBlockProperties properties, BlocklyComment comment) {
        return new NeuralNetworkAddRawData<>(x, y, z, properties, comment);
    }

    public Expr<V> getX() {
        return this.x;
    }

    public Expr<V> getY() {
        return this.y;
    }

    public Expr<V> getZ() {
        return this.z;
    }

    @Override
    public String toString() {
        return new StringBuilder()
            .append("NeuralNetworkAddRawData [ ")
            .append(this.x)
            .append(",")
            .append(this.y)
            .append(",")
            .append(this.z)
            .append("]")
            .toString();
    }

    @Override
    protected V acceptImpl(IVisitor<V> visitor) {
        return ((IArduinoVisitor<V>) visitor).visitNeuralNetworkAddRawData(this);
    }

    /**
     * Transformation from JAXB object to corresponding AST object.
     *
     * @param block for transformation
     * @param helper class for making the transformation
     * @return corresponding AST object
     */
    public static <V> Phrase<V> jaxbToAst(Block block, AbstractJaxb2Ast<V> helper) {
        List<Value> values = AbstractJaxb2Ast.extractValues(block, (short) 3);
        Expr<V> x = helper.convertPhraseToExpr(helper.extractValue(values, new ExprParam("X", BlocklyType.CAPTURED_TYPE)));
        Expr<V> y = helper.convertPhraseToExpr(helper.extractValue(values, new ExprParam("Y", BlocklyType.CAPTURED_TYPE)));
        Expr<V> z = helper.convertPhraseToExpr(helper.extractValue(values, new ExprParam("Z", BlocklyType.CAPTURED_TYPE)));
        return NeuralNetworkAddRawData.make(x, y, z, AbstractJaxb2Ast.extractBlockProperties(block), AbstractJaxb2Ast.extractComment(block));
    }

    @Override
    public Block astToBlock() {
        Block jaxbDestination = new Block();
        Ast2JaxbHelper.setBasicProperties(this, jaxbDestination);
        Ast2JaxbHelper.addValue(jaxbDestination, "X", getX());
        Ast2JaxbHelper.addValue(jaxbDestination, "Y", getY());
        Ast2JaxbHelper.addValue(jaxbDestination, "Z", getZ());
        return jaxbDestination;
    }
}
