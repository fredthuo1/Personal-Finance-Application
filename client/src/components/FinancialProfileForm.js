import React, { useState } from 'react';
import styled from 'styled-components';

const FormContainer = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const FormSection = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  margin-bottom: 10px;
  color: #333;
`;

const InputContainer = styled.div`
  margin-bottom: 10px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1em;
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 1em;
  color: #fff;
  background: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 10px;
  &:disabled {
    background: #aaa;
  }
`;

const DeleteButton = styled(Button)`
  background: #dc3545;
`;

const FinancialProfileForm = ({ onSubmit, userId }) => {
    const [formData, setFormData] = useState({
        userId,
        assets: {
            cashAndSavings: 0,
            investments: 0,
            retirementAccounts: {},
            realEstate: 0,
            personalProperty: 0,
            otherAssets: 0
        },
        liabilities: {
            loans: [],
            creditCardDebt: 0,
            otherLiabilities: 0
        }
    });

    const [retirementAccountType, setRetirementAccountType] = useState('');
    const [retirementAccountAmount, setRetirementAccountAmount] = useState(0);

    const handleChange = (event) => {
        const { name, value } = event.target;

        if (name.includes('.')) {
            const parts = name.split('.');
            if (parts[0] === 'liabilities' && parts[1].startsWith('loans[')) {
                const loanIndex = parseInt(parts[1].match(/\[(\d+)\]/)[1]);
                const fieldName = parts[2];
                setFormData(prevFormData => ({
                    ...prevFormData,
                    liabilities: {
                        ...prevFormData.liabilities,
                        loans: prevFormData.liabilities.loans.map((loan, index) =>
                            index === loanIndex ? { ...loan, [fieldName]: value } : loan
                        )
                    }
                }));
            } else {
                setFormData(prevFormData => ({
                    ...prevFormData,
                    [parts[0]]: {
                        ...prevFormData[parts[0]],
                        [parts[1]]: value
                    }
                }));
            }
        } else {
            setFormData(prevFormData => ({
                ...prevFormData,
                [name]: value
            }));
        }
    };

    const handleRetirementAccountAdd = () => {
        if (retirementAccountType && retirementAccountAmount) {
            setFormData(prevFormData => ({
                ...prevFormData,
                assets: {
                    ...prevFormData.assets,
                    retirementAccounts: {
                        ...prevFormData.assets.retirementAccounts,
                        [retirementAccountType]: Number(retirementAccountAmount)
                    }
                }
            }));
            setRetirementAccountType('');
            setRetirementAccountAmount(0);
        }
    };

    const handleRetirementAccountDelete = (type) => {
        setFormData(prevFormData => ({
            ...prevFormData,
            assets: {
                ...prevFormData.assets,
                retirementAccounts: Object.fromEntries(
                    Object.entries(prevFormData.assets.retirementAccounts).filter(([t]) => t !== type)
                )
            }
        }));
    };

    const handleLoanAdd = () => {
        setFormData(prevFormData => ({
            ...prevFormData,
            liabilities: {
                ...prevFormData.liabilities,
                loans: [...prevFormData.liabilities.loans, { type: '', balance: 0, interestRate: 0, monthlyPayment: 0 }]
            }
        }));
    };

    const handleLoanRemove = (index) => {
        setFormData(prevFormData => ({
            ...prevFormData,
            liabilities: {
                ...prevFormData.liabilities,
                loans: prevFormData.liabilities.loans.filter((_, i) => i !== index)
            }
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit(formData);
    };

    return (
        <FormContainer>
            <form onSubmit={handleSubmit}>
                <FormSection>
                    <SectionTitle>Assets</SectionTitle>
                    <InputContainer>
                        <Label>Cash and Savings:</Label>
                        <Input
                            type="number"
                            name="assets.cashAndSavings"
                            value={formData.assets.cashAndSavings}
                            onChange={handleChange}
                        />
                    </InputContainer>
                    <InputContainer>
                        <Label>Investments:</Label>
                        <Input
                            type="number"
                            name="assets.investments"
                            value={formData.assets.investments}
                            onChange={handleChange}
                        />
                    </InputContainer>
                    <InputContainer>
                        <Label>Real Estate:</Label>
                        <Input
                            type="number"
                            name="assets.realEstate"
                            value={formData.assets.realEstate}
                            onChange={handleChange}
                        />
                    </InputContainer>
                    <InputContainer>
                        <Label>Personal Property:</Label>
                        <Input
                            type="number"
                            name="assets.personalProperty"
                            value={formData.assets.personalProperty}
                            onChange={handleChange}
                        />
                    </InputContainer>
                    <InputContainer>
                        <Label>Other Assets:</Label>
                        <Input
                            type="number"
                            name="assets.otherAssets"
                            value={formData.assets.otherAssets}
                            onChange={handleChange}
                        />
                    </InputContainer>
                    <SectionTitle>Retirement Accounts</SectionTitle>
                    {Object.entries(formData.assets.retirementAccounts).map(([type, amount]) => (
                        <InputContainer key={type}>
                            <span>{type}: ${amount.toFixed(2)}</span>
                            <DeleteButton type="button" onClick={() => handleRetirementAccountDelete(type)}>Delete</DeleteButton>
                        </InputContainer>
                    ))}
                    <InputContainer>
                        <Label>Account Type (e.g., 401k)</Label>
                        <Input
                            type="text"
                            value={retirementAccountType}
                            onChange={(e) => setRetirementAccountType(e.target.value)}
                        />
                    </InputContainer>
                    <InputContainer>
                        <Label>Amount</Label>
                        <Input
                            type="number"
                            value={retirementAccountAmount}
                            onChange={(e) => setRetirementAccountAmount(e.target.value)}
                        />
                    </InputContainer>
                    <Button type="button" onClick={handleRetirementAccountAdd}>Add</Button>
                </FormSection>

                <FormSection>
                    <SectionTitle>Liabilities</SectionTitle>
                    <InputContainer>
                        <Label>Credit Card Debt:</Label>
                        <Input
                            type="number"
                            name="liabilities.creditCardDebt"
                            value={formData.liabilities.creditCardDebt}
                            onChange={handleChange}
                        />
                    </InputContainer>
                    <InputContainer>
                        <Label>Other Liabilities:</Label>
                        <Input
                            type="number"
                            name="liabilities.otherLiabilities"
                            value={formData.liabilities.otherLiabilities}
                            onChange={handleChange}
                        />
                    </InputContainer>
                    <SectionTitle>Loans</SectionTitle>
                    {formData.liabilities.loans.map((loan, index) => (
                        <FormSection key={index}>
                            <InputContainer>
                                <Label>Type:</Label>
                                <Input
                                    type="text"
                                    name={`liabilities.loans[${index}].type`}
                                    value={loan.type}
                                    onChange={handleChange}
                                />
                            </InputContainer>
                            <InputContainer>
                                <Label>Balance:</Label>
                                <Input
                                    type="number"
                                    name={`liabilities.loans[${index}].balance`}
                                    value={loan.balance}
                                    onChange={handleChange}
                                />
                            </InputContainer>
                            <InputContainer>
                                <Label>Interest Rate:</Label>
                                <Input
                                    type="number"
                                    name={`liabilities.loans[${index}].interestRate`}
                                    value={loan.interestRate}
                                    onChange={handleChange}
                                />
                            </InputContainer>
                            <InputContainer>
                                <Label>Monthly Payment:</Label>
                                <Input
                                    type="number"
                                    name={`liabilities.loans[${index}].monthlyPayment`}
                                    value={loan.monthlyPayment}
                                    onChange={handleChange}
                                />
                            </InputContainer>
                            <DeleteButton type="button" onClick={() => handleLoanRemove(index)}>Remove</DeleteButton>
                        </FormSection>
                    ))}
                    <Button type="button" onClick={handleLoanAdd}>Add Loan</Button>
                </FormSection>
                <Button type="submit">Submit</Button>
            </form>
        </FormContainer>
    );
};

export default FinancialProfileForm;
