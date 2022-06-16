yarn nyc yarn test_all
perl -i -pe's/\"path\":\".+(\\\\|\/)file:(\\\\|\/)/\"path\":\"/g' coverage/coverage-final.json
perl -i -pe's/\".+(\\\\|\/)file:(\\\\|\/)/\"/g' coverage/coverage-final.json
yarn nyc report --reporter html --reporter text --reporter text-summary -t coverage --report-dir coverage
