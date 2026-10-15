import { CartesianChart } from './CartesianChart';

/**
 * Drop-in replacements for the @ant-design/charts / @ant-design/plots components the app
 * uses, taking the same G2Plot v2 config props and rendering shadcn (recharts) charts.
 */
export function Line(props) {
  return <CartesianChart {...props} kind="line" />;
}
export function Area(props) {
  return <CartesianChart {...props} kind="area" />;
}
export function Column(props) {
  return <CartesianChart {...props} kind="column" />;
}
export function Bar(props) {
  return <CartesianChart {...props} kind="bar" />;
}

export { Pie } from './Pie';
export { Funnel } from './Funnel';
export { WordCloud } from './WordCloud';
