# TODO

## Make project as a module

- [ ] add `"type": "module"` to package.json
- [ ] make sure `npm run dev` still shows TypeScript errors in the terminal

To enable using top-level awaits (e.g. for `app.register(fastifyRawBody)`) and
to get rid of `--disable-warning=MODULE_TYPELESS_PACKAGE_JSON` when running in
production, the project must be marked as a module. This will break the current
development setup with ts-node. We can _almost_ get there in development by:

1. Swap `-r ts-node/register` for `--loader ts-node/esm` to support imports.
2. Add `"module": "NodeNext"` and `"moduleResolution": "nodenext"` to
   tsconfig.json.
3. Add file extension to the non-module import:

   ```diff
   -import type FromSchema from "./json-schema-to-ts";
   +import type FromSchema from "./json-schema-to-ts.ts";
   ```

But because of [a long-standing ts-node issue][#2085] this will throw exceptions
for type errors, instead of printing them to the terminal. The sole reason for
keeping ts-node around was for it to warn about type errors while developing so
this does not fulfill that purpose.

[#2085]: https://github.com/TypeStrong/ts-node/issues/2085

We might have to swap ts-node for something else to keep the same developer
experience as today.

## Switch logging to Pino

- [ ] change `console` calls for `request.log` or `fastify.log`

Fastify is already including pino as a dependency whether it is being used or
not, so this will not add anything to the size of the project. Using this for
logging changes logs into JSON which is hopefully easy to parse (e.g. in
Datadog) and associates logs to specific requests.

See also [the Logging reference documentation][docs] from Fastify.

[docs]: https://fastify.dev/docs/v5.2.x/Reference/Logging/
