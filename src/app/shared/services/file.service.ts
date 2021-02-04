import {
  AngularFireList,
  AngularFireObject,
  AngularFireDatabase,
} from "@angular/fire/database";
import { Injectable } from "@angular/core";
import { FirebaseApp } from "@angular/fire";
import { AngularFireStorage } from "@angular/fire/storage";
import { promise } from "protractor";
import { FileExt } from "../models/file.ext";

@Injectable({
  providedIn: "root",
})
export class FileService {
  constructor(private db: AngularFireDatabase, private fa: FirebaseApp) {}

  getFileByName(fileName: string): Promise<any> {
    const storageRef = this.fa.storage().ref().child(fileName).getDownloadURL();

    return storageRef;

    // storageRef.then(url => {
    //     return url;
    // }).catch((error) =>
    //     console.log(error)
    // );
  }

  getSlideShowImages() {
    const listRef = this.fa.storage().ref().child("slideShow");

    // Find all the prefixes and items.
    listRef
      .listAll()
      .then((res) => {
        res.prefixes.forEach((folderRef) => {
          // All the prefixes under listRef.
          // You may call listAll() recursively on them.
          console.log(folderRef);
        });
        res.items.forEach((itemRef) => {
          // All the items under listRef.
          console.log(itemRef);
        });
      })
      .catch((error) => {
        // Uh-oh, an error occurred!
      });
  }

  uploadFile(path: string, file: FileExt) {
    const storageRef = this.fa.storage().ref();

    const uploadTask = storageRef
      .child(`${path}/${file.key$}.${file.fileExtension}`)
      .put(file);

    return uploadTask;
  }
}
