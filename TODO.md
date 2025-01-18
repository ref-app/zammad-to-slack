# TODO

## Make project as a module

- [ ] add `"type": "module"` to package.json
- [ ] make sure `npm run dev` still shows TypeScript errors in the terminal

To get rid of `--disable-warning=MODULE_TYPELESS_PACKAGE_JSON` when running in
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
