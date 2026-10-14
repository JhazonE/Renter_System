// Pin the suite to UTC regardless of the dev machine's timezone.
//
// Railway runs the backend in UTC while the meal windows are Philippine
// wall-clock times. On a UTC+8 machine (PH local) the two coincide and the
// whole PH-vs-server-timezone bug class silently passes, so the tests must
// force UTC rather than inherit it.
process.env.TZ = 'UTC';
