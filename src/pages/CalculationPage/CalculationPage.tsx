import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "store/store.ts";
import {
    deleteDraftCalculation,
    fetchCalculation,
    removeCalculation, sendDraftCalculation,
    triggerUpdateMM,
    updateCalculation
} from "store/slices/calculationsSlice.ts";
import {Button, Col, Form, Row} from "reactstrap";
import {E_CalculationStatus, T_Resistor} from "modules/types.ts";
import ResistorCard from "components/ResistorCard/ResistorCard.tsx";
import CustomInput from "components/CustomInput/CustomInput.tsx";

const CalculationPage = () => {
    const { id } = useParams<{id: string}>();

    const dispatch = useAppDispatch()

    const navigate = useNavigate()

    const {is_authenticated} = useAppSelector((state) => state.user)

    const calculation = useAppSelector((state) => state.calculations.calculation)

    const [current, setCurrent] = useState<string>(calculation?.current)

    useEffect(() => {
        if (!is_authenticated) {
            navigate("/")
        }
    }, [is_authenticated]);

    useEffect(() => {
        is_authenticated && dispatch(fetchCalculation(id))
        return () => dispatch(removeCalculation())
    }, []);

    useEffect(() => {
        setCurrent(calculation?.current)
    }, [calculation]);

    const sendCalculation = async (e) => {
        e.preventDefault()

        await saveCalculation()

        await dispatch(sendDraftCalculation())

        navigate("/calculations")
    }

    const saveCalculation = async (e?) => {
        e?.preventDefault()

        await dispatch(triggerUpdateMM())
        await dispatch(triggerUpdateMM())
    }

    const deleteCalculation = async () => {
        await dispatch(deleteDraftCalculation())
        navigate("/resistors")
    }

    if (!calculation) {
        return (
            <div>

            </div>
        )
    }

    const isDraft = calculation.status == E_CalculationStatus.Draft
    const isCompleted = calculation.status == E_CalculationStatus.Completed

    return (
        <Form onSubmit={sendCalculation} className="pb-5">
            <h2 className="mb-5">{isDraft ? "Черновое вычисление" : `Вычисление №${id}` }</h2>
            <Row className="mb-5 fs-5 w-25">
                {isCompleted && <CustomInput label="Сила тока" value={current} disabled={true}/>}
            </Row>
            <Row>
                {calculation.resistors.length > 0 ? calculation.resistors.map((resistor:T_Resistor) => (
                    <Row key={resistor.id} className="d-flex justify-content-center mb-5">
                        <ResistorCard resistor={resistor} showRemoveBtn={isDraft} editMM={isDraft} />
                    </Row>
                )) :
                    <h3 className="text-center">Резисторы не добавлены</h3>
                }
            </Row>
            {isDraft &&
                <Row className="mt-5">
                    <Col className="d-flex gap-5 justify-content-center">
                        <Button color="success" className="fs-4" onClick={saveCalculation}>Сохранить</Button>
                        <Button color="primary" className="fs-4" type="submit">Отправить</Button>
                        <Button color="danger" className="fs-4" onClick={deleteCalculation}>Удалить</Button>
                    </Col>
                </Row>
            }
        </Form>
    );
};

export default CalculationPage