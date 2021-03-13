import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const OrderShow = ({ order, currentUser }) => {

    const [timeLeft, setTimeLeft] = useState(0);
    const { doRequest, errors } = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId: order.id
        },
        onSuccess: () => Router.push('/orders')
    })

    useEffect(() => {
        const findTimeLeft = () => {
            const msLeft = new Date(order.expiresAt) - new Date();
            setTimeLeft(Math.round(msLeft/1000));
        };
        findTimeLeft();
        const timerId = setInterval(findTimeLeft, 1000);

        return () => {
            clearInterval(timerId);
        };
    }, []);

    if (timeLeft < 0) {
        return <div>This order is expired!</div>;
    }

    return (
        <div>
            {timeLeft} seconds until this order expires!
            <StripeCheckout 
                token={({ id }) => doRequest({ token: id })}
                stripeKey='pk_test_51ITKCVC9LPFbRp6WsmSx4PwQtSqJ8Pc5JMK8Qwk7jLl5M42yJ6D2omvm8uAUl0sLZk8FmJ4KUlMviFCiuGsTXSMq00itxrvPEX'
                amount={order.ticket.price * 100}
                email={currentUser.email}
            />
            {errors}
        </div>
    );
};

OrderShow.getInitialProps = async (context, client) => {
    const { orderId } = context.query;

    const { data } = await client.get(`/api/orders/${orderId}`);

    return { order: data };
}

export default OrderShow;