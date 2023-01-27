import { BaseSource, Item, SourceOptions } from "https://deno.land/x/ddu_vim@v2.2.0/types.ts";
import { Denops, fn } from "https://deno.land/x/ddu_vim@v2.2.0/deps.ts";
import { ActionData } from "https://deno.land/x/ddu_kind_file@v0.3.2/file.ts";

type Params = {
   "loc": boolean; 
}

export class Source extends BaseSource<Params> {
  override kind = "file";
  override gather(args :{
      denops: Denops;
      sourceOptions: SourceOptions;
      sourceParams: Params;
  }): ReadableStream<Item<ActionData>[]>{
    return new ReadableStream<Item<ActionData>[]>({
      async start(controller) {
        const clist = await (args.sourceParams.loc ? fn.getloclist(args.denops, 0) :  fn.getqflist(args.denops));
        const items: Item<ActionData>[] = [];
        const regexp = new RegExp(/(\s|\t|\n|\v)+/g);
        for(const citem of clist){
            items.push({
                word: (await fn.bufname(args.denops, citem.bufnr) + ":" + citem.text).replaceAll(regexp, " "),
                action: {
                    path: await fn.bufname(args.denops, citem.bufnr)
                },
            });
        }
        controller.enqueue(items);
        controller.close();
      },
    });
  }

  override params(): Params {
    return {
        "loc" : false,
    };
  }
}
