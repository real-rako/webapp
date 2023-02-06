FROM node
Workdir /RAKOWEBSCHOOL
copy . .
RUN npm i
CMD ["npm", "start"]
EXPOSE 3000
