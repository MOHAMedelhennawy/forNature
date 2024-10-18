import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import User from "../models/user.js"

const classes = {
  'user': User
}

yargs(hideBin(process.argv))
  .command('all <data>', 'Search in any data with id', (yargs) => {
    return yargs
      .positional('data', {
        describe: "Data name to search in",
        type: "string",
      })
  }, async (argv) => {
    const repository = new FileRepository(argv.data)
    const _class = classes[argv.data];

    const data = await _class.getAll(repository);
    console.log(data)
  })
  .command('find <data> <id>', 'Search in any data with id', (yargs) => {
    return yargs
      .positional('data', {
        describe: "Data name to search in",
        type: "string",
      })
      .positional('id', {
        describe: "Data id to search",
        type: "string",
      })
  }, async (argv) => {
    const repository = new FileRepository(argv.data)
    const __class = classes[argv.data];

    const data = await __class.getByID(repository, argv.id);
    console.log(data)
  })
  .command('add <data>', 'Add new data', (yargs) => {
    return yargs
      .positional('data', {
        describe: "Data name to search in",
        type: "string",
      })
      .positional('name', {
        describe: "Name of the item",
        type: "string",
      })
  }, async (argv) => {
   
  })
  .command('remove <data> <id>', 'Remove data by id', (yargs) => {
    return yargs
      .positional('data', {
        describe: "Data name to search in",
        type: "string",
      })
      .positional('id', {
        describe: "Data id to search",
        type: "string",
      })
  }, async (argv) => {
   
  })
  .command('update <data> <id> <name>', 'Update data by id', (yargs) => {
    return yargs
      .positional('data', {
        describe: "Data name to search in",
        type: "string",
      })
      .positional('id', {
        describe: "Data id to search",
        type: "string",
      })
  }, async (argv) => {
    
  })
  .demandCommand(1, 'You need at least one positional argument')
  .parse()