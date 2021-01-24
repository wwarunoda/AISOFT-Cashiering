import {
  AngularFireList,
  AngularFireObject,
  AngularFireDatabase,
} from "@angular/fire/database";
import { Injectable } from "@angular/core";
import { FirebaseApp } from "@angular/fire";
import { AngularFireStorage } from "@angular/fire/storage";
import { promise } from "protractor";

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

  uploadFile(list: string, file: File): void {
    // const key = this.db.list(list).push(file.name).key;
    // this.fa.storage().ref().put(file).then((snapshot) => {
    //     console.log("Uploaded a blob or file!", snapshot, key);
    // });
  }
}
